import logging
from utils.response_utils import format_response, format_error_response
from utils.validation_utils import validate_job_data, validate_resume_data
from utils.error_utils import AIModelError, ValidationError, log_error
from models.candidate_matcher import CandidateMatcher
import os
import sys
from datetime import datetime, timezone


class ModelController:
    """
    Controller for AI model training and management
    This handles the machine learning aspects of the recruitment system
    """

    def __init__(self):
        self.matcher = CandidateMatcher()

    def train_model(self, request_data):
        """
        Train the AI model with historical hiring data

        This endpoint receives training data from your Node.js server and trains
        the AI model to recognize successful hiring patterns.

        Expected data format:
        {
            "training_data": [
                {
                    "job": { job_data },
                    "candidate": { candidate_data },
                    "resume": { resume_data },
                    "outcome": "hired" | "rejected"
                }
            ]
        }
        """
        try:
            # Validate request data structure
            if not request_data or "training_data" not in request_data:
                raise ValidationError("Missing training_data in request body")

            training_data = request_data["training_data"]

            if not isinstance(training_data, list) or len(training_data) == 0:
                raise ValidationError("training_data must be a non-empty array")

            # Filter for successful hiring cases only
            # We want to train the model on what good matches look like
            successful_matches = []

            for idx, data_point in enumerate(training_data):
                try:
                    # Validate data structure
                    if (
                        "job" not in data_point
                        or "candidate" not in data_point
                        or "resume" not in data_point
                    ):
                        logging.warning(
                            f"Skipping invalid training data point {idx}: missing required fields"
                        )
                        continue

                    # Only use successful hires for training
                    if data_point.get("outcome") == "hired":
                        # Validate individual components
                        job_valid, job_error = validate_job_data(data_point["job"])
                        if not job_valid:
                            logging.warning(
                                f"Skipping training data {idx}: {job_error}"
                            )
                            continue

                        resume_valid, resume_error = validate_resume_data(
                            data_point["resume"]
                        )
                        if not resume_valid:
                            logging.warning(
                                f"Skipping training data {idx}: {resume_error}"
                            )
                            continue

                        successful_matches.append(data_point)

                except Exception as e:
                    logging.warning(
                        f"Error processing training data point {idx}: {str(e)}"
                    )
                    continue

            if len(successful_matches) < 10:
                raise ValidationError(
                    f"Insufficient successful hiring examples. Found {len(successful_matches)}, need at least 10"
                )

            logging.info(
                f"Starting model training with {len(successful_matches)} successful hiring examples"
            )

            # Train the model using CandidateMatcher
            training_results = self.matcher.train_model(successful_matches)

            # Return training results
            return format_response(
                success=True,
                message=f"AI model trained successfully with {len(successful_matches)} examples",
                data={
                    "training_results": training_results,
                    "total_examples_processed": len(training_data),
                    "successful_examples_used": len(successful_matches),
                    "model_ready": self.matcher.is_trained,
                    "model_version": training_results.get("model_version", "1.0.0"),
                    "vocabulary_size": training_results.get("vocabulary_size", 0),
                    "skills_vocabulary_size": training_results.get(
                        "skills_vocabulary_size", 0
                    ),
                    "training_timestamp": training_results.get("training_timestamp"),
                },
            )

        except ValidationError as e:
            return format_error_response(
                message=e.message,
                status_code=400,
                error_code="TRAINING_VALIDATION_ERROR",
            )
        except AIModelError as e:
            log_error(e, "Model training failed")
            return format_error_response(
                message=e.message, status_code=500, error_code=e.error_code
            )
        except Exception as e:
            log_error(e, "Unexpected error during model training")
            return format_error_response(
                message="An unexpected error occurred during model training",
                status_code=500,
                error_code="TRAINING_UNEXPECTED_ERROR",
            )

    def get_model_status(self):
        """
        Get current model status and performance information
        This helps your Node.js server understand if the AI is ready to work
        """
        try:
            # Get basic status information
            status_data = {
                "is_trained": self.matcher.is_trained,
                "model_version": self.matcher.training_metadata.get(
                    "model_version", "1.0.0"
                ),
                "scoring_weights": self.matcher.weights,
                "supported_features": [
                    "skills_matching",
                    "experience_relevance",
                    "education_alignment",
                    "industry_experience",
                    "text_similarity",
                ],
                "ready_for_shortlisting": self.matcher.is_trained,
            }

            # Add detailed training information if model is trained
            if self.matcher.is_trained and self.matcher.training_metadata:
                metadata = self.matcher.training_metadata

                status_data.update(
                    {
                        "training_info": {
                            "training_samples": metadata.get("training_samples", 0),
                            "valid_samples": metadata.get("valid_samples", 0),
                            "vocabulary_size": metadata.get("vocabulary_size", 0),
                            "skills_vocabulary_size": metadata.get(
                                "skills_vocabulary_size", 0
                            ),
                            "training_timestamp": metadata.get("training_timestamp"),
                            "status": metadata.get("status", "unknown"),
                        },
                        "model_health": {
                            "vectorizers_loaded": bool(
                                self.matcher.text_vectorizer
                                and self.matcher.skills_vectorizer
                            ),
                            "weights_configured": bool(self.matcher.weights),
                            "storage_path": self.matcher.config.MODEL_STORAGE_PATH,
                        },
                    }
                )

                message = f"AI model is trained and ready for candidate shortlisting (trained on {metadata.get('valid_samples', 0)} examples)"
            else:
                status_data.update(
                    {
                        "training_info": {
                            "training_samples": 0,
                            "valid_samples": 0,
                            "vocabulary_size": 0,
                            "skills_vocabulary_size": 0,
                            "training_timestamp": None,
                            "status": "not_trained",
                        },
                        "model_health": {
                            "vectorizers_loaded": False,
                            "weights_configured": bool(self.matcher.weights),
                            "storage_path": self.matcher.config.MODEL_STORAGE_PATH,
                        },
                    }
                )

                message = (
                    "AI model requires training before it can shortlist candidates"
                )

            return format_response(success=True, message=message, data=status_data)

        except Exception as e:
            log_error(e, "Error getting model status")
            return format_error_response(
                message="Failed to retrieve model status",
                status_code=500,
                error_code="MODEL_STATUS_ERROR",
            )

    def get_model_metrics(self):
        """
        Get detailed model metrics and performance statistics
        This provides insights into how well the AI model is performing
        """
        try:
            if not self.matcher.is_trained:
                raise AIModelError(
                    "AI model is not trained yet. Please train the model before retrieving metrics.",
                    error_code="MODEL_NOT_TRAINED",
                )

            # Get basic model information
            metrics_data = {
                "model_performance": {
                    "is_trained": self.matcher.is_trained,
                    "model_version": self.matcher.training_metadata.get(
                        "model_version", "1.0.0"
                    ),
                    "training_timestamp": self.matcher.training_metadata.get(
                        "training_timestamp"
                    ),
                    "training_samples": self.matcher.training_metadata.get(
                        "training_samples", 0
                    ),
                    "valid_samples_used": self.matcher.training_metadata.get(
                        "valid_samples", 0
                    ),
                },
                "model_components": {
                    "text_vectorizer": {
                        "vocabulary_size": self.matcher.training_metadata.get(
                            "vocabulary_size", 0
                        ),
                        "feature_count": (
                            len(self.matcher.text_vectorizer.vocabulary_)
                            if self.matcher.text_vectorizer
                            else 0
                        ),
                        "max_features": 1000,
                        "ngram_range": "(1, 2)",
                        "status": (
                            "loaded" if self.matcher.text_vectorizer else "not_loaded"
                        ),
                    },
                    "skills_vectorizer": {
                        "vocabulary_size": self.matcher.training_metadata.get(
                            "skills_vocabulary_size", 0
                        ),
                        "feature_count": (
                            len(self.matcher.skills_vectorizer.vocabulary_)
                            if self.matcher.skills_vectorizer
                            else 0
                        ),
                        "max_features": 500,
                        "ngram_range": "(1, 3)",
                        "status": (
                            "loaded" if self.matcher.skills_vectorizer else "not_loaded"
                        ),
                    },
                },
                "scoring_configuration": {
                    "weights": self.matcher.weights,
                    "scoring_components": [
                        "skills_match",
                        "experience_relevance",
                        "education_alignment",
                        "industry_experience",
                        "text_similarity",
                    ],
                    "max_candidates_returned": self.matcher.config.MAX_CANDIDATES,
                },
                "model_health": {
                    "vectorizers_functional": self._check_vectorizers_health(),
                    "storage_path": self.matcher.config.MODEL_STORAGE_PATH,
                    "storage_accessible": self._check_storage_health(),
                    "memory_usage": self._get_memory_usage(),
                    "last_health_check": self._get_current_timestamp(),
                },
                "performance_statistics": self._get_performance_statistics(),
            }

            return format_response(
                success=True,
                message="Model metrics retrieved successfully",
                data=metrics_data,
            )

        except AIModelError as e:
            log_error(e, "Error retrieving model metrics")
            return format_error_response(
                message=e.message, status_code=500, error_code=e.error_code
            )
        except Exception as e:
            log_error(e, "Unexpected error retrieving model metrics")
            return format_error_response(
                message="An unexpected error occurred while retrieving model metrics",
                status_code=500,
                error_code="METRICS_UNEXPECTED_ERROR",
            )

    def _check_vectorizers_health(self):
        """Check if vectorizers are loaded and functional"""
        try:
            if not self.matcher.text_vectorizer or not self.matcher.skills_vectorizer:
                return False

            # Test vectorizers with sample data
            test_text = "test software development experience"
            test_skills = "Python JavaScript"

            text_vector = self.matcher.text_vectorizer.transform([test_text])
            skills_vector = self.matcher.skills_vectorizer.transform([test_skills])

            return text_vector.shape[0] == 1 and skills_vector.shape[0] == 1
        except:
            return False

    def _check_storage_health(self):
        """Check if model storage directory is accessible"""
        try:
            storage_path = self.matcher.config.MODEL_STORAGE_PATH
            return os.path.exists(storage_path) and os.access(storage_path, os.W_OK)
        except:
            return False

    def _get_memory_usage(self):
        """Get approximate memory usage of model components"""
        try:
            memory_info = {
                "text_vectorizer_size": (
                    sys.getsizeof(self.matcher.text_vectorizer)
                    if self.matcher.text_vectorizer
                    else 0
                ),
                "skills_vectorizer_size": (
                    sys.getsizeof(self.matcher.skills_vectorizer)
                    if self.matcher.skills_vectorizer
                    else 0
                ),
                "total_estimated_mb": 0,
            }

            total_bytes = (
                memory_info["text_vectorizer_size"]
                + memory_info["skills_vectorizer_size"]
            )
            memory_info["total_estimated_mb"] = int(
                round(total_bytes / (1024 * 1024), 2)
            )

            return memory_info
        except:
            return {"error": "Unable to calculate memory usage"}

    def _get_performance_statistics(self):
        """Get performance and capability statistics"""
        try:
            metadata = self.matcher.training_metadata

            stats = {
                "training_efficiency": {
                    "total_training_samples": metadata.get("training_samples", 0),
                    "valid_samples_processed": metadata.get("valid_samples", 0),
                    "data_utilization_rate": 0,
                    "training_status": metadata.get("status", "unknown"),
                },
                "model_capabilities": {
                    "supported_features": [
                        "skills_matching",
                        "experience_relevance",
                        "education_alignment",
                        "industry_experience",
                        "text_similarity",
                    ],
                    "text_processing": {
                        "max_features_text": 1000,
                        "max_features_skills": 500,
                        "supports_semantic_matching": True,
                        "supports_keyword_matching": True,
                    },
                    "scoring_features": {
                        "weighted_scoring": True,
                        "detailed_explanations": True,
                        "recommendation_strength": True,
                        "score_breakdown": True,
                    },
                },
                "recommendation_quality": {
                    "scoring_range": "0.0 - 1.0",
                    "recommendation_categories": [
                        "strong_recommend",
                        "recommend",
                        "consider",
                        "weak_consider",
                        "not_recommended",
                    ],
                    "includes_match_explanations": True,
                },
            }

            # Calculate data utilization rate
            total_samples = int(metadata.get("training_samples", 0))
            valid_samples = int(metadata.get("valid_samples", 0))
            if total_samples > 0:
                stats["training_efficiency"]["data_utilization_rate"] = float(
                    round((valid_samples / total_samples) * 100, 2)
                )

            return stats
        except:
            return {"error": "Unable to calculate performance statistics"}

    def _get_current_timestamp(self):
        """Get current timestamp in ISO format"""
        try:
            return datetime.now(timezone.utc).isoformat()
        except:
            return "unknown"
