import re
import logging
import numpy as np
import json
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import joblib
import os
from datetime import datetime, timezone

from utils.error_utils import AIModelError
from config.settings import AppConfig


class CandidateMatcher:
    """
    AI Model for matching candidates to job requirements

    This model works like a sophisticated HR professional, evaluating multiple
    aspects of a candidate's profile against job requirements to find the best matches.

    FIXED ISSUES:
    - ✅ Proper training status persistence to disk
    - ✅ Robust model loading with detailed error handling
    - ✅ Automatic directory creation
    - ✅ Training state validation
    - ✅ Better error recovery
    """

    def __init__(self):
        """Initialize the candidate matcher with configuration"""
        self.config = AppConfig()
        self.skills_vectorizer = None
        self.text_vectorizer = None
        self.is_trained = False
        self.training_metadata = {}

        # Scoring weights from configuration
        self.weights = {
            "skills_match": self.config.WEIGHT_SKILLS,
            "experience_relevance": self.config.WEIGHT_EXPERIENCE,
            "education_alignment": self.config.WEIGHT_EDUCATION,
            "industry_experience": self.config.WEIGHT_INDUSTRY,
            "text_similarity": self.config.WEIGHT_TEXT,
        }

        # Ensure model storage directory exists
        self._ensure_model_directory()

        # Load any existing trained models
        self._load_model_if_exists()

    def _ensure_model_directory(self):
        """Ensure the model storage directory exists with proper permissions"""
        try:
            os.makedirs(self.config.MODEL_STORAGE_PATH, exist_ok=True)

            # Test write permissions by creating a test file
            test_file = os.path.join(self.config.MODEL_STORAGE_PATH, ".test_write")
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)

            logging.info(
                f"✅ Model storage directory ready: {self.config.MODEL_STORAGE_PATH}"
            )

        except Exception as e:
            logging.error(f"❌ Failed to create model storage directory: {e}")
            # Fallback to temp directory
            import tempfile

            self.config.MODEL_STORAGE_PATH = os.path.join(
                tempfile.gettempdir(), "optahire_models"
            )
            os.makedirs(self.config.MODEL_STORAGE_PATH, exist_ok=True)
            logging.warning(
                f"⚠️ Using fallback directory: {self.config.MODEL_STORAGE_PATH}"
            )

    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Train the AI model with historical job and application data

        This is like teaching the AI what successful matches look like by showing
        it examples of past hiring decisions.

        Args:
            training_data: List of dictionaries containing job and successful candidate data

        Returns:
            Dictionary with training results and model performance metrics
        """
        try:
            logging.info("🎓 Starting AI model training...")

            if not training_data or len(training_data) < 10:
                raise AIModelError(
                    "Insufficient training data. Need at least 10 successful job-candidate matches",
                    error_code="INSUFFICIENT_TRAINING_DATA",
                )

            # Extract text data for vectorizer training
            job_descriptions = []
            candidate_profiles = []
            skills_data = []

            for i, data in enumerate(training_data):
                try:
                    # Combine job information into searchable text
                    job_text = f"{data['job']['title']} {data['job']['description']} {data['job']['requirements']}"
                    job_descriptions.append(job_text)

                    # FIXED: Access experience and education from resume, not candidate
                    resume_data = data["resume"]
                    candidate_text = f"{resume_data.get('experience', '')} {resume_data.get('education', '')}"
                    candidate_profiles.append(candidate_text)

                    # Extract skills for specialized matching
                    candidate_skills = resume_data.get("skills", [])
                    if isinstance(candidate_skills, list):
                        skills_data.extend(candidate_skills)
                    else:
                        # Handle case where skills might be a string
                        skills_data.append(str(candidate_skills))

                except KeyError as e:
                    logging.warning(f"Missing data in training example {i}: {e}")
                    continue
                except Exception as e:
                    logging.warning(f"Error processing training example {i}: {e}")
                    continue

            if len(job_descriptions) < 10:
                raise AIModelError(
                    f"Too few valid training examples after processing. Got {len(job_descriptions)}, need at least 10",
                    error_code="INSUFFICIENT_VALID_DATA",
                )

            # Train the text similarity vectorizer (for general compatibility)
            # This learns to understand the language patterns in job descriptions and resumes
            all_texts = job_descriptions + candidate_profiles

            # Filter out empty texts
            all_texts = [text for text in all_texts if text.strip()]

            if len(all_texts) < 5:
                raise AIModelError(
                    "Insufficient text data for training vectorizer",
                    error_code="INSUFFICIENT_TEXT_DATA",
                )

            self.text_vectorizer = TfidfVectorizer(
                max_features=1000,  # Keep top 1000 most important words
                stop_words="english",  # Remove common words like "the", "and"
                ngram_range=(1, 2),  # Consider both single words and pairs
                min_df=2,  # Word must appear in at least 2 documents
                max_df=0.8,  # Ignore words that appear in 80%+ of documents
            )
            self.text_vectorizer.fit(all_texts)

            # Train the skills vectorizer (for technical skills matching)
            # This specializes in understanding technical terminology and skills
            skills_data = [skill for skill in skills_data if skill and skill.strip()]

            if len(skills_data) < 5:
                logging.warning(
                    "Limited skills data for training, using basic skills vectorizer"
                )
                # Create a basic skills vocabulary
                skills_data = [
                    "JavaScript",
                    "Python",
                    "React",
                    "Node.js",
                    "HTML",
                    "CSS",
                    "Java",
                    "C++",
                    "SQL",
                    "Git",
                    "Agile",
                    "Leadership",
                ]

            self.skills_vectorizer = TfidfVectorizer(
                max_features=500,
                stop_words="english",
                ngram_range=(1, 3),  # Include technical phrases up to 3 words
                min_df=1,  # Technical terms might be rare but important
                token_pattern=r"\b[a-zA-Z][a-zA-Z0-9+#\-\.]*\b",  # Handle tech terms like "C++"
            )

            # Create a comprehensive skills vocabulary from training data
            all_skills_text = " ".join(skills_data)
            self.skills_vectorizer.fit([all_skills_text])

            # FIXED: Store training metadata
            self.training_metadata = {
                "model_version": self.config.MODEL_VERSION,
                "training_samples": len(training_data),
                "valid_samples": len(job_descriptions),
                "vocabulary_size": len(self.text_vectorizer.vocabulary_),
                "skills_vocabulary_size": len(self.skills_vectorizer.vocabulary_),
                "training_timestamp": datetime.now(timezone.utc).isoformat(),
                "weights": self.weights.copy(),
                "status": "training_completed",
            }

            # FIXED: Save models with proper error handling BEFORE setting is_trained
            save_success = self._save_model()

            if not save_success:
                raise AIModelError(
                    "Training completed but failed to save models to disk",
                    error_code="MODEL_SAVE_FAILED",
                )

            # FIXED: Only set trained status after successful save
            self.is_trained = True

            logging.info(
                f"✅ Model training completed successfully with {len(job_descriptions)} valid samples"
            )

            return self.training_metadata

        except Exception as e:
            logging.error(f"❌ Model training failed: {str(e)}")
            # FIXED: Reset training state on failure
            self.is_trained = False
            self.text_vectorizer = None
            self.skills_vectorizer = None
            self.training_metadata = {}

            raise AIModelError(
                f"Failed to train AI model: {str(e)}", error_code="TRAINING_FAILED"
            )

    def _save_model(self) -> bool:
        """
        Save trained model to disk for persistence

        FIXED: Better error handling and training state persistence

        Returns:
            bool: True if save was successful, False otherwise
        """
        try:
            # Ensure directory exists
            self._ensure_model_directory()

            if not self.text_vectorizer or not self.skills_vectorizer:
                logging.error("❌ Cannot save model: vectorizers not trained")
                return False

            # Save vectorizers
            text_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "text_vectorizer.pkl"
            )
            skills_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "skills_vectorizer.pkl"
            )

            joblib.dump(self.text_vectorizer, text_path)
            joblib.dump(self.skills_vectorizer, skills_path)

            # FIXED: Save training state and metadata to separate file
            state_data = {
                "is_trained": True,
                "training_metadata": self.training_metadata,
                "model_files": {
                    "text_vectorizer": "text_vectorizer.pkl",
                    "skills_vectorizer": "skills_vectorizer.pkl",
                },
                "saved_timestamp": datetime.now(timezone.utc).isoformat(),
                "model_version": self.config.MODEL_VERSION,
            }

            state_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "training_state.json"
            )
            with open(state_path, "w") as f:
                json.dump(state_data, f, indent=2)

            # Verify files were actually saved
            if not all(
                os.path.exists(path) for path in [text_path, skills_path, state_path]
            ):
                logging.error("❌ Model save verification failed: some files missing")
                return False

            logging.info("✅ Model and training state saved successfully")
            return True

        except Exception as e:
            logging.error(f"❌ Failed to save model: {str(e)}")
            return False

    def _load_model_if_exists(self):
        """
        Load previously trained model if available

        FIXED: More robust loading with proper state management
        """
        try:
            # Check for training state file first
            state_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "training_state.json"
            )
            text_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "text_vectorizer.pkl"
            )
            skills_path = os.path.join(
                self.config.MODEL_STORAGE_PATH, "skills_vectorizer.pkl"
            )

            # If no state file exists, try legacy loading
            if not os.path.exists(state_path):
                logging.info(
                    "🔍 No training state file found, checking for legacy model files..."
                )
                if os.path.exists(text_path) and os.path.exists(skills_path):
                    return self._load_legacy_model(text_path, skills_path)
                else:
                    logging.info(
                        "📝 No trained model found. Model will need to be trained."
                    )
                    return

            # Load training state
            with open(state_path, "r") as f:
                state_data = json.load(f)

            # Verify state data integrity
            if not state_data.get("is_trained", False):
                logging.warning("⚠️ Training state indicates model is not trained")
                return

            # Verify model files exist
            if not all(os.path.exists(path) for path in [text_path, skills_path]):
                logging.warning("⚠️ Training state exists but model files are missing")
                self._cleanup_incomplete_state()
                return

            # Load vectorizers
            self.text_vectorizer = joblib.load(text_path)
            self.skills_vectorizer = joblib.load(skills_path)

            # Restore metadata
            self.training_metadata = state_data.get("training_metadata", {})

            # Verify loaded models are functional
            if not self._verify_loaded_models():
                logging.warning("⚠️ Loaded models failed verification")
                self._cleanup_incomplete_state()
                return

            # FIXED: Only set trained status after everything loads successfully
            self.is_trained = True

            trained_time = self.training_metadata.get("training_timestamp", "Unknown")
            sample_count = self.training_metadata.get("valid_samples", "Unknown")

            logging.info(
                f"✅ Pre-trained model loaded successfully (trained: {trained_time}, samples: {sample_count})"
            )

        except Exception as e:
            logging.warning(f"⚠️ Could not load existing model: {str(e)}")
            self._cleanup_incomplete_state()

    def _load_legacy_model(self, text_path: str, skills_path: str) -> bool:
        """Load model files without state file (backward compatibility)"""
        try:
            self.text_vectorizer = joblib.load(text_path)
            self.skills_vectorizer = joblib.load(skills_path)

            if self._verify_loaded_models():
                self.is_trained = True
                self.training_metadata = {
                    "model_version": self.config.MODEL_VERSION,
                    "status": "legacy_model_loaded",
                    "loaded_timestamp": datetime.now(timezone.utc).isoformat(),
                }
                logging.info("✅ Legacy model loaded successfully")
                return True
            else:
                logging.warning("⚠️ Legacy model failed verification")
                return False
        except Exception as e:
            logging.warning(f"⚠️ Failed to load legacy model: {str(e)}")
            return False

    def _verify_loaded_models(self) -> bool:
        """Verify that loaded models are functional"""
        try:
            if not self.text_vectorizer or not self.skills_vectorizer:
                return False

            # Test vectorizers with sample data
            test_text = "test software development experience python javascript"
            test_skills = "Python JavaScript React"

            # Test text vectorizer
            text_vector = self.text_vectorizer.transform([test_text])
            if text_vector.shape[0] != 1:
                return False

            # Test skills vectorizer
            skills_vector = self.skills_vectorizer.transform([test_skills])
            if skills_vector.shape[0] != 1:
                return False

            return True

        except Exception as e:
            logging.warning(f"⚠️ Model verification failed: {str(e)}")
            return False

    def _cleanup_incomplete_state(self):
        """Clean up incomplete or corrupted model state"""
        self.is_trained = False
        self.text_vectorizer = None
        self.skills_vectorizer = None
        self.training_metadata = {}

        logging.info("🧹 Cleaned up incomplete model state")

    def shortlist_candidates(
        self, job_data: Dict[str, Any], applications: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Shortlist top candidates for a given job

        This is the main function that your Node.js server will call when a job
        posting is closed and candidates need to be evaluated.

        Args:
            job_data: Dictionary containing job description and requirements
            applications: List of applications with candidate data and resumes

        Returns:
            List of top candidates with their matching scores and explanations
        """
        try:
            logging.info(
                f"🎯 Starting candidate shortlisting for job: {job_data.get('title', 'Unknown')}"
            )

            if not self.is_trained:
                raise AIModelError(
                    "AI model is not trained yet. Please train the model first.",
                    error_code="MODEL_NOT_TRAINED",
                )

            # FIXED: Additional verification that models are actually loaded
            if not self.text_vectorizer or not self.skills_vectorizer:
                raise AIModelError(
                    "AI model components are missing. Please retrain the model.",
                    error_code="MODEL_COMPONENTS_MISSING",
                )

            if not applications:
                return []

            # Score each candidate against the job requirements
            candidate_scores = []

            for application in applications:
                try:
                    score_result = self._calculate_candidate_score(
                        job_data, application
                    )
                    candidate_scores.append(score_result)
                except Exception as e:
                    logging.warning(
                        f"⚠️ Failed to score candidate {application.get('candidateId', 'Unknown')}: {str(e)}"
                    )
                    continue

            # Sort candidates by total score (highest first)
            candidate_scores.sort(key=lambda x: x["total_score"], reverse=True)

            # Return top candidates with detailed scoring information
            top_candidates = candidate_scores[: self.config.MAX_CANDIDATES]

            logging.info(
                f"✅ Shortlisted {len(top_candidates)} candidates from {len(applications)} applications"
            )

            return top_candidates

        except Exception as e:
            logging.error(f"❌ Candidate shortlisting failed: {str(e)}")
            raise AIModelError(
                f"Failed to shortlist candidates: {str(e)}",
                error_code="SHORTLISTING_FAILED",
            )

    def _calculate_candidate_score(
        self, job_data: Dict[str, Any], application: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive matching score for a single candidate

        This function breaks down the evaluation into multiple components,
        just like how a human recruiter would systematically evaluate a resume.

        Args:
            job_data: Job information and requirements
            application: Application with candidate and resume data

        Returns:
            Dictionary with detailed scoring breakdown and reasoning
        """
        candidate = application.get("candidate", {})
        resume = application.get("resume", {})

        # Extract and clean text data for analysis
        job_text = self._prepare_job_text(job_data)
        candidate_text = self._prepare_candidate_text(resume)

        # Calculate individual score components
        scores = {}

        # 1. Skills Matching (Most Important - configurable%)
        scores["skills_match"] = self._calculate_skills_match(
            job_data.get("requirements", ""), resume.get("skills", [])
        )

        # 2. Experience Relevance (Very Important - configurable%)
        scores["experience_relevance"] = self._calculate_experience_relevance(
            job_text, resume.get("experience", "")
        )

        # 3. Education Alignment (Important - configurable%)
        scores["education_alignment"] = self._calculate_education_alignment(
            job_data.get("requirements", ""), resume.get("education", "")
        )

        # 4. Industry Experience (Helpful - configurable%)
        scores["industry_experience"] = self._calculate_industry_match(
            job_data.get("category", ""),
            resume.get("industry", ""),
            resume.get("company", ""),
        )

        # 5. Overall Text Similarity (Context - configurable%)
        scores["text_similarity"] = self._calculate_text_similarity(
            job_text, candidate_text
        )

        # Calculate weighted total score
        total_score = sum(scores[key] * self.weights[key] for key in scores)

        # Generate human-readable explanation of the match
        explanation = self._generate_match_explanation(scores, job_data["title"])

        return {
            "application_id": application["id"],
            "candidate_id": application["candidateId"],
            "candidate_name": f"{candidate.get('firstName', '')} {candidate.get('lastName', '')}".strip(),
            "total_score": round(total_score, 3),
            "score_breakdown": {key: round(value, 3) for key, value in scores.items()},
            "match_explanation": explanation,
            "recommendation_strength": self._get_recommendation_strength(total_score),
        }

    def _calculate_education_alignment(
        self, job_requirements: str, education: str
    ) -> float:
        """
        Evaluate how well the candidate's education matches job requirements

        This considers both the level of education and the relevance of the field of study.
        For example, a Computer Science degree would score higher for a software development role.
        """
        if not education or not job_requirements:
            return 0.5  # Neutral score when information is missing

        education_lower = education.lower()
        requirements_lower = job_requirements.lower()

        # Define education level scoring
        # Higher education levels get bonus points, but practical experience often matters more
        education_levels = {
            "phd": 1.0,
            "doctorate": 1.0,
            "ph.d": 1.0,
            "master": 0.9,
            "msc": 0.9,
            "mba": 0.9,
            "ms": 0.9,
            "bachelor": 0.8,
            "bs": 0.8,
            "ba": 0.8,
            "bsc": 0.8,
            "associate": 0.6,
            "diploma": 0.5,
            "certificate": 0.4,
        }

        # Calculate education level score
        level_score = 0.0
        for level, score in education_levels.items():
            if level in education_lower:
                level_score = max(level_score, score)
                break
        else:
            level_score = 0.3  # Default for unspecified education

        # Calculate field relevance using text similarity
        try:
            if self.text_vectorizer:
                edu_vector = self.text_vectorizer.transform([education])
                req_vector = self.text_vectorizer.transform([job_requirements])
                field_relevance = cosine_similarity(edu_vector, req_vector)[0][0]
            else:
                field_relevance = self._simple_keyword_match(
                    education, job_requirements
                )
        except:
            field_relevance = 0.3

        # Combine level and relevance (relevance is more important)
        final_score = (level_score * 0.3) + (field_relevance * 0.7)
        return min(1.0, final_score)

    def _calculate_industry_match(
        self, job_category: str, candidate_industry: str, candidate_company: str
    ) -> float:
        """
        Evaluate how well the candidate's industry experience matches the job

        This considers both the specific industry and the type of companies they've worked for.
        Industry experience can be valuable for understanding business context and regulations.
        """
        if not job_category:
            return 0.5  # Neutral score when job category is not specified

        score = 0.0

        # Direct industry match
        if candidate_industry and job_category.lower() in candidate_industry.lower():
            score += 0.6

        # Related industry patterns (you can expand this based on your domain knowledge)
        industry_relationships = {
            "it": ["software", "technology", "tech", "computer", "digital"],
            "engineering": ["engineering", "technical", "manufacturing", "automotive"],
            "finance": ["financial", "banking", "investment", "accounting"],
            "marketing": [
                "advertising",
                "digital marketing",
                "social media",
                "communications",
            ],
            "sales": ["sales", "business development", "account management", "retail"],
        }

        job_cat_lower = job_category.lower()
        for category, related_terms in industry_relationships.items():
            if category in job_cat_lower:
                for term in related_terms:
                    if candidate_industry and term in candidate_industry.lower():
                        score += 0.4
                        break
                    if candidate_company and term in candidate_company.lower():
                        score += 0.2
                        break

        return min(1.0, score)

    def _calculate_text_similarity(self, job_text: str, candidate_text: str) -> float:
        """
        Calculate overall text similarity between job description and candidate profile

        This provides a general compatibility score based on language patterns and terminology.
        While less specific than skills matching, it can catch nuanced alignments.
        """
        if not job_text or not candidate_text:
            return 0.0

        try:
            if self.text_vectorizer:
                job_vector = self.text_vectorizer.transform([job_text])
                candidate_vector = self.text_vectorizer.transform([candidate_text])
                similarity = cosine_similarity(job_vector, candidate_vector)[0][0]
                return similarity
            else:
                return self._simple_keyword_match(job_text, candidate_text)
        except Exception as e:
            logging.warning(f"Text similarity calculation failed: {str(e)}")
            return 0.0

    def _calculate_skills_bonus(
        self, candidate_skills: List[str], job_requirements: str
    ) -> float:
        """
        Calculate bonus points for high-demand or specialized skills

        This rewards candidates who have rare or particularly valuable skills
        that are explicitly mentioned in the job requirements.
        """
        if not candidate_skills or not job_requirements:
            return 0.0

        requirements_lower = job_requirements.lower()
        bonus = 0.0

        # Ensure candidate_skills is a list
        if not isinstance(candidate_skills, list):
            candidate_skills = [str(candidate_skills)]

        # High-demand technical skills (you can customize this list based on your market)
        high_demand_skills = {
            "python": 0.05,
            "javascript": 0.05,
            "react": 0.04,
            "node.js": 0.04,
            "aws": 0.06,
            "docker": 0.05,
            "kubernetes": 0.06,
            "microservices": 0.05,
            "machine learning": 0.07,
            "ai": 0.06,
            "data science": 0.06,
            "postgresql": 0.04,
            "mongodb": 0.04,
            "redis": 0.03,
            "git": 0.02,
            "agile": 0.03,
            "devops": 0.05,
        }

        for skill in candidate_skills:
            skill_lower = str(skill).lower().strip()

            # Check if skill is explicitly mentioned in job requirements
            if skill_lower in requirements_lower:
                # Give bonus based on skill demand level
                bonus += high_demand_skills.get(
                    skill_lower, 0.02
                )  # Default small bonus

        return min(0.15, bonus)  # Cap bonus at 15% to prevent over-weighting

    def _generate_match_explanation(
        self, scores: Dict[str, float], job_title: str
    ) -> str:
        """
        Generate human-readable explanation of why this candidate is a good match

        This helps recruiters understand the AI's reasoning and builds trust in the system.
        """
        explanations = []

        # Skills assessment
        skills_score = scores["skills_match"]
        if skills_score >= 0.8:
            explanations.append("🎯 Excellent technical skills alignment")
        elif skills_score >= 0.6:
            explanations.append("✅ Good technical skills match")
        elif skills_score >= 0.4:
            explanations.append("🔧 Some relevant technical skills")
        else:
            explanations.append("📚 Limited technical skills match - may need training")

        # Experience assessment
        exp_score = scores["experience_relevance"]
        if exp_score >= 0.7:
            explanations.append("💼 Highly relevant work experience")
        elif exp_score >= 0.5:
            explanations.append("📈 Solid relevant experience")
        else:
            explanations.append("🌱 Limited relevant experience - potential for growth")

        # Education assessment
        edu_score = scores["education_alignment"]
        if edu_score >= 0.6:
            explanations.append("🎓 Educational background aligns well")
        elif edu_score >= 0.4:
            explanations.append("📖 Adequate educational foundation")

        # Industry experience
        industry_score = scores["industry_experience"]
        if industry_score >= 0.6:
            explanations.append("🏢 Strong industry experience")
        elif industry_score >= 0.3:
            explanations.append("🌐 Some relevant industry background")

        # Overall recommendation
        total_score = sum(scores[key] * self.weights[key] for key in scores)
        if total_score >= 0.75:
            recommendation = f"🌟 Highly recommended for {job_title} position"
        elif total_score >= 0.6:
            recommendation = f"👍 Good candidate for {job_title} position"
        elif total_score >= 0.45:
            recommendation = (
                f"🤔 Potential candidate for {job_title} - consider for interview"
            )
        else:
            recommendation = f"⚠️ May not be the best fit for {job_title} - significant gaps identified"

        return f"{recommendation}. {'. '.join(explanations)}."

    def _get_recommendation_strength(self, total_score: float) -> str:
        """
        Convert numerical score to recommendation strength category

        This provides a quick way to categorize candidates for recruiters.
        """
        if total_score >= 0.8:
            return "strong_recommend"
        elif total_score >= 0.65:
            return "recommend"
        elif total_score >= 0.5:
            return "consider"
        elif total_score >= 0.35:
            return "weak_consider"
        else:
            return "not_recommended"

    def _prepare_job_text(self, job_data: Dict[str, Any]) -> str:
        """
        Prepare job text for analysis by combining relevant fields
        """
        text_parts = []

        if job_data.get("title"):
            text_parts.append(job_data["title"])
        if job_data.get("description"):
            text_parts.append(job_data["description"])
        if job_data.get("requirements"):
            text_parts.append(job_data["requirements"])
        if job_data.get("category"):
            text_parts.append(job_data["category"])

        return " ".join(text_parts)

    def _prepare_candidate_text(self, resume: Dict[str, Any]) -> str:
        """
        Prepare candidate text for analysis by combining relevant fields
        """
        text_parts = []

        if resume.get("experience"):
            text_parts.append(resume["experience"])
        if resume.get("education"):
            text_parts.append(resume["education"])
        if resume.get("skills"):
            skills = resume["skills"]
            if isinstance(skills, list):
                text_parts.append(" ".join(skills))
            else:
                text_parts.append(str(skills))
        if resume.get("industry"):
            text_parts.append(resume["industry"])
        if resume.get("company"):
            text_parts.append(resume["company"])

        return " ".join(text_parts)

    def _calculate_skills_match(
        self, job_requirements: str, candidate_skills: List[str]
    ) -> float:
        """
        Calculate how well candidate skills match job requirements
        """
        if not candidate_skills or not job_requirements:
            return 0.0

        # Ensure candidate_skills is a list
        if not isinstance(candidate_skills, list):
            candidate_skills = [str(candidate_skills)]

        requirements_lower = job_requirements.lower()
        matched_skills = 0
        total_skills = len(candidate_skills)

        for skill in candidate_skills:
            skill_lower = str(skill).lower().strip()
            if skill_lower in requirements_lower:
                matched_skills += 1

        # Base score from direct matches
        base_score = matched_skills / max(1, total_skills) if total_skills > 0 else 0.0

        # Add bonus for high-demand skills
        bonus = self._calculate_skills_bonus(candidate_skills, job_requirements)

        # Use skills vectorizer for semantic matching if available
        if self.skills_vectorizer:
            try:
                skills_text = " ".join([str(skill) for skill in candidate_skills])
                skills_vector = self.skills_vectorizer.transform([skills_text])
                req_vector = self.skills_vectorizer.transform([job_requirements])
                semantic_score = cosine_similarity(skills_vector, req_vector)[0][0]

                # Combine direct matching with semantic similarity
                final_score = (base_score * 0.6) + (semantic_score * 0.4) + bonus
            except:
                final_score = base_score + bonus
        else:
            final_score = base_score + bonus

        return min(1.0, final_score)

    def _calculate_experience_relevance(self, job_text: str, experience: str) -> float:
        """
        Calculate how relevant candidate's experience is to the job
        """
        if not experience or not job_text:
            return 0.0

        try:
            if self.text_vectorizer:
                exp_vector = self.text_vectorizer.transform([experience])
                job_vector = self.text_vectorizer.transform([job_text])
                similarity = cosine_similarity(exp_vector, job_vector)[0][0]
                return similarity
            else:
                return self._simple_keyword_match(experience, job_text)
        except:
            return self._simple_keyword_match(experience, job_text)

    def _simple_keyword_match(self, text1: str, text2: str) -> float:
        """
        Simple keyword-based matching when vectorizers are not available
        """
        if not text1 or not text2:
            return 0.0

        # Clean and split text into words
        words1 = set(re.findall(r"\b\w+\b", text1.lower()))
        words2 = set(re.findall(r"\b\w+\b", text2.lower()))

        # Remove common stop words
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
        }
        words1 = words1 - stop_words
        words2 = words2 - stop_words

        if not words1 or not words2:
            return 0.0

        # Calculate Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))

        return intersection / union if union > 0 else 0.0
