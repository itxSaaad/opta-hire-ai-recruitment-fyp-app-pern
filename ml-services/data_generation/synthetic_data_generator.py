import json
import random
import uuid
from faker import Faker

# Initialize Faker for generating realistic names, emails, etc.
fake = Faker()


class OptaHireSyntheticDataGenerator:
    """
    Generates realistic training data for recruitment AI

    This creates diverse scenarios covering different industries, skill levels,
    and job types to give the AI a comprehensive understanding of good matches.
    """

    def __init__(self):
        self.job_categories = {
            "IT": {
                "roles": [
                    "Frontend Developer",
                    "Backend Developer",
                    "Full Stack Developer",
                    "Mobile App Developer",
                    "DevOps Engineer",
                    "Data Scientist",
                    "Machine Learning Engineer",
                    "QA Engineer",
                    "UI/UX Designer",
                    "Software Architect",
                    "Technical Lead",
                    "Product Manager",
                ],
                "skills": [
                    "JavaScript",
                    "Python",
                    "React",
                    "Node.js",
                    "Angular",
                    "Vue.js",
                    "Java",
                    "C#",
                    "PHP",
                    "Ruby",
                    "Go",
                    "TypeScript",
                    "HTML",
                    "CSS",
                    "MongoDB",
                    "PostgreSQL",
                    "MySQL",
                    "Redis",
                    "Docker",
                    "Kubernetes",
                    "AWS",
                    "Azure",
                    "GCP",
                    "Git",
                    "Agile",
                    "Scrum",
                    "REST API",
                    "GraphQL",
                    "Machine Learning",
                    "TensorFlow",
                    "PyTorch",
                    "Pandas",
                    "NumPy",
                    "Linux",
                    "CI/CD",
                    "Jenkins",
                    "Terraform",
                ],
                "companies": [
                    "TechCorp Solutions",
                    "Digital Innovations Ltd",
                    "CodeCraft Systems",
                    "DataFlow Technologies",
                    "CloudWorks Inc",
                    "NextGen Software",
                    "Agile Dynamics",
                    "DevOps Masters",
                    "AI Solutions Group",
                ],
            },
            "Engineering": {
                "roles": [
                    "Mechanical Engineer",
                    "Electrical Engineer",
                    "Civil Engineer",
                    "Chemical Engineer",
                    "Automotive Engineer",
                    "Aerospace Engineer",
                    "Environmental Engineer",
                    "Project Engineer",
                    "Design Engineer",
                    "Process Engineer",
                    "Quality Engineer",
                    "R&D Engineer",
                ],
                "skills": [
                    "AutoCAD",
                    "SolidWorks",
                    "MATLAB",
                    "CAD Design",
                    "Project Management",
                    "Quality Control",
                    "Manufacturing",
                    "Process Optimization",
                    "Technical Documentation",
                    "Problem Solving",
                    "Team Leadership",
                    "Safety Protocols",
                    "Lean Manufacturing",
                    "Six Sigma",
                ],
                "companies": [
                    "Industrial Solutions Corp",
                    "Engineering Excellence Ltd",
                    "Manufacturing Innovations",
                    "Design Engineering Group",
                    "Process Solutions Inc",
                    "Technical Systems Ltd",
                ],
            },
            "Sales": {
                "roles": [
                    "Sales Representative",
                    "Account Manager",
                    "Business Development Manager",
                    "Sales Director",
                    "Inside Sales Specialist",
                    "Key Account Manager",
                    "Territory Sales Manager",
                    "Sales Coordinator",
                    "Customer Success Manager",
                ],
                "skills": [
                    "Sales Strategy",
                    "Lead Generation",
                    "Customer Relationship Management",
                    "Negotiation",
                    "Presentation Skills",
                    "CRM Software",
                    "Cold Calling",
                    "Market Research",
                    "Account Planning",
                    "Team Management",
                    "Revenue Growth",
                    "Client Retention",
                    "Communication Skills",
                ],
                "companies": [
                    "Sales Excellence Corp",
                    "Growth Dynamics Ltd",
                    "Revenue Solutions Inc",
                    "Customer Success Group",
                    "Business Development Partners",
                ],
            },
            "Marketing": {
                "roles": [
                    "Digital Marketing Manager",
                    "Content Marketing Specialist",
                    "SEO Specialist",
                    "Social Media Manager",
                    "Marketing Coordinator",
                    "Brand Manager",
                    "Email Marketing Specialist",
                    "Marketing Analyst",
                    "Product Marketing Manager",
                    "Growth Marketing Manager",
                ],
                "skills": [
                    "Digital Marketing",
                    "SEO",
                    "SEM",
                    "Social Media Marketing",
                    "Content Strategy",
                    "Email Marketing",
                    "Google Analytics",
                    "Marketing Automation",
                    "Brand Management",
                    "Creative Design",
                    "A/B Testing",
                    "Lead Generation",
                    "Marketing Research",
                ],
                "companies": [
                    "Marketing Innovations Ltd",
                    "Digital Growth Agency",
                    "Brand Solutions Corp",
                    "Creative Marketing Group",
                    "Performance Marketing Inc",
                ],
            },
            "Finance": {
                "roles": [
                    "Financial Analyst",
                    "Accountant",
                    "Finance Manager",
                    "Investment Analyst",
                    "Risk Manager",
                    "Treasury Analyst",
                    "Financial Planner",
                    "Audit Manager",
                    "Tax Specialist",
                ],
                "skills": [
                    "Financial Analysis",
                    "Excel",
                    "Financial Modeling",
                    "Accounting",
                    "Budgeting",
                    "Forecasting",
                    "Risk Assessment",
                    "Investment Analysis",
                    "Tax Planning",
                    "Audit",
                    "Compliance",
                ],
                "companies": [
                    "Financial Services Group",
                    "Investment Solutions Ltd",
                    "Accounting Excellence Corp",
                    "Risk Management Inc",
                ],
            },
        }

        self.education_levels = [
            "Bachelor's Degree in Computer Science",
            "Bachelor's Degree in Engineering",
            "Bachelor's Degree in Business Administration",
            "Master's Degree in Computer Science",
            "Master's Degree in Engineering",
            "Master's Degree in Business Administration",
            "PhD in Computer Science",
            "Diploma in Information Technology",
            "Certificate in Web Development",
        ]

        self.experience_templates = {
            "junior": {
                "years": "0-2 years",
                "template": "Fresh graduate with strong academic background and internship experience at {company}. Worked on {projects} projects involving {skills}. Eager to learn and contribute to team success.",
            },
            "mid": {
                "years": "3-5 years",
                "template": "Experienced {role} with {years} of professional experience at {company}. Led development of {projects} projects, working extensively with {skills}. Strong problem-solving abilities and team collaboration skills.",
            },
            "senior": {
                "years": "6-10 years",
                "template": "Senior {role} with over {years} of experience leading teams and complex projects at {company}. Expertise in {skills}, with proven track record of delivering high-quality solutions. Mentored junior developers and drove technical innovation.",
            },
            "expert": {
                "years": "10+ years",
                "template": "Highly experienced {role} with {years} of industry experience across multiple companies including {company}. Deep expertise in {skills}, with extensive experience in architecture design, team leadership, and strategic planning.",
            },
        }

    def generate_job_posting(self, category="IT", level="mid"):
        """Generate a realistic job posting"""
        category_data = self.job_categories[category]
        role = random.choice(category_data["roles"])
        company = random.choice(category_data["companies"])

        # Select relevant skills for this role
        required_skills = random.sample(category_data["skills"], random.randint(4, 8))
        preferred_skills = random.sample(category_data["skills"], random.randint(2, 4))

        # Generate experience requirements based on level
        experience_req = {
            "junior": f"0-2 years of experience in {role.lower()} role",
            "mid": f"3-5 years of experience in {role.lower()} or related field",
            "senior": f"6+ years of experience with proven track record in {role.lower()}",
            "expert": f"10+ years of senior-level experience in {role.lower()} with leadership responsibilities",
        }

        # Generate salary ranges based on level
        salary_ranges = {
            "junior": "$40k - $60k",
            "mid": "$60k - $85k",
            "senior": "$85k - $120k",
            "expert": "$120k - $150k",
        }

        job_description = f"""
We are seeking a talented {role} to join our growing team at {company}. 
In this role, you will be responsible for developing and maintaining high-quality software solutions, 
collaborating with cross-functional teams, and contributing to our innovative projects.

Key Responsibilities:
• Design, develop, and maintain software applications
• Collaborate with team members to deliver high-quality solutions
• Participate in code reviews and maintain coding standards
• Troubleshoot and resolve technical issues
• Stay updated with latest technologies and best practices

What we offer:
• Competitive salary and benefits package
• Flexible working arrangements
• Professional development opportunities
• Modern technology stack and tools
• Collaborative and innovative work environment
        """.strip()

        requirements = f"""
Required Skills: {', '.join(required_skills[:4])}
Preferred Skills: {', '.join(preferred_skills)}
Experience: {experience_req[level]}
Education: Bachelor's degree in Computer Science, Engineering, or related field
        """.strip()

        benefits = """
• Health, dental, and vision insurance
• 401(k) retirement plan with company matching  
• Flexible PTO policy
• Professional development budget
• Remote work options
• Modern office with latest technology
        """.strip()

        return {
            "id": str(uuid.uuid4()),
            "title": role,
            "description": job_description,
            "company": company,
            "requirements": requirements,
            "benefits": benefits,
            "salaryRange": salary_ranges[level],
            "category": category,
            "location": random.choice(
                [
                    "New York, NY",
                    "San Francisco, CA",
                    "Austin, TX",
                    "Seattle, WA",
                    "Boston, MA",
                    "Remote",
                ]
            ),
            "isClosed": False,
            "recruiterId": str(uuid.uuid4()),
            "level": level,  # For internal use in matching
            "required_skills": required_skills[:4],  # For internal use in matching
            "preferred_skills": preferred_skills,  # For internal use in matching
        }

    def generate_candidate_profile(self, category="IT", level="mid", target_job=None):
        """Generate a realistic candidate profile with resume"""
        category_data = self.job_categories[category]

        # Generate basic candidate info
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"{first_name.lower()}.{last_name.lower()}@{fake.free_email_domain()}"

        candidate = {
            "id": str(uuid.uuid4()),
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "phone": fake.phone_number(),
            "isVerified": True,
            "isCandidate": True,
            "isRecruiter": False,
            "isInterviewer": False,
            "isAdmin": False,
        }

        # Generate resume based on level and category
        resume = self._generate_resume(candidate["id"], category, level, target_job)

        return candidate, resume

    def _generate_resume(self, user_id, category, level, target_job=None):
        """Generate a detailed resume for a candidate"""
        category_data = self.job_categories[category]

        # Select role and skills based on level and category
        if target_job:
            # Make candidate somewhat aligned with target job for realistic matching
            title = target_job["title"]
            if random.random() < 0.7:  # 70% chance of skill overlap
                candidate_skills = random.sample(
                    target_job["required_skills"], random.randint(2, 4)
                ) + random.sample(category_data["skills"], random.randint(3, 6))
            else:
                candidate_skills = random.sample(
                    category_data["skills"], random.randint(4, 8)
                )
        else:
            title = random.choice(category_data["roles"])
            candidate_skills = random.sample(
                category_data["skills"], random.randint(4, 8)
            )

        # Remove duplicates and limit skills
        candidate_skills = list(set(candidate_skills))[: random.randint(5, 10)]

        # Generate experience based on level
        experience_data = self.experience_templates[level]
        experience_years = experience_data["years"]
        company = random.choice(category_data["companies"])

        experience = experience_data["template"].format(
            role=title,
            years=experience_years,
            company=company,
            projects=random.randint(3, 12),
            skills=", ".join(candidate_skills[:3]),
        )

        # Add more detailed work history for senior levels
        if level in ["senior", "expert"]:
            additional_company = random.choice(category_data["companies"])
            experience += f"\n\nPreviously worked as {random.choice(category_data['roles'])} at {additional_company}, where I gained valuable experience in {', '.join(random.sample(candidate_skills, 2))} and contributed to multiple successful product launches."

        # Generate education
        education = random.choice(self.education_levels)
        if (
            level == "expert" and random.random() < 0.4
        ):  # 40% of experts have advanced degrees
            education = random.choice(
                [
                    "Master's Degree in Computer Science",
                    "Master's Degree in Engineering",
                    "PhD in Computer Science",
                ]
            )

        # Generate achievements based on level
        achievements_by_level = {
            "junior": [
                "Completed internship with excellent performance review",
                "Graduated summa cum laude",
                "Led university capstone project",
                "Active in coding bootcamp community",
            ],
            "mid": [
                "Increased team productivity by 25% through process improvements",
                "Led development of key product features",
                "Mentored 2-3 junior developers",
                "Contributed to open source projects",
            ],
            "senior": [
                "Led team of 8+ developers on major product redesign",
                "Reduced system latency by 40% through optimization",
                "Established coding standards and best practices for organization",
                "Speaker at industry conferences",
            ],
            "expert": [
                "Architected scalable system handling 1M+ daily users",
                "Led digital transformation initiative saving $2M annually",
                "Published research papers in industry journals",
                "Established and led center of excellence for emerging technologies",
            ],
        }

        achievements = "; ".join(
            random.sample(achievements_by_level[level], random.randint(2, 3))
        )

        return {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "title": title,
            "summary": f"Passionate {title} with {experience_years} of experience in {category.lower()}. Specialized in {', '.join(candidate_skills[:3])} with a track record of delivering high-quality solutions.",
            "headline": f"{title} | {experience_years} Experience | {category} Expert",
            "skills": candidate_skills,
            "experience": experience,
            "education": education,
            "industry": category,
            "availability": random.choice(["Immediate", "Two weeks", "One month"]),
            "company": company,
            "achievements": achievements,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "portfolio": (
                f"https://github.com/{fake.user_name()}" if category == "IT" else None
            ),
        }

    def generate_training_example(self, scenario_type="good_match"):
        """
        Generate a complete training example (job + candidate + outcome)

        scenario_type can be:
        - 'good_match': Skills and experience align well with job
        - 'poor_match': Significant skills or experience mismatch
        - 'overqualified': Candidate has much more experience than needed
        - 'underqualified': Candidate lacks required experience/skills
        """

        # Select random category and level
        category = random.choice(list(self.job_categories.keys()))

        if scenario_type == "good_match":
            # Generate job and matching candidate
            level = random.choice(["junior", "mid", "senior", "expert"])
            job = self.generate_job_posting(category, level)
            candidate, resume = self.generate_candidate_profile(category, level, job)
            outcome = "hired"

        elif scenario_type == "poor_match":
            # Generate job in one category, candidate in another
            job_category = category
            candidate_category = random.choice(
                [cat for cat in self.job_categories.keys() if cat != job_category]
            )
            level = random.choice(["junior", "mid", "senior"])

            job = self.generate_job_posting(job_category, level)
            candidate, resume = self.generate_candidate_profile(
                candidate_category, level
            )
            outcome = "rejected"

        elif scenario_type == "overqualified":
            # Senior candidate for junior job
            job_level = random.choice(["junior", "mid"])
            candidate_level = "expert" if job_level == "junior" else "senior"

            job = self.generate_job_posting(category, job_level)
            candidate, resume = self.generate_candidate_profile(
                category, candidate_level, job
            )
            outcome = "rejected"  # Often rejected due to overqualification

        elif scenario_type == "underqualified":
            # Junior candidate for senior job
            job_level = random.choice(["senior", "expert"])
            candidate_level = "junior"

            job = self.generate_job_posting(category, job_level)
            candidate, resume = self.generate_candidate_profile(
                category, candidate_level, job
            )
            outcome = "rejected"

        else:
            # Default case - treat as good match
            level = random.choice(["junior", "mid", "senior", "expert"])
            job = self.generate_job_posting(category, level)
            candidate, resume = self.generate_candidate_profile(category, level, job)
            outcome = "hired"

        # Create application
        application = {
            "id": str(uuid.uuid4()),
            "candidateId": candidate["id"],
            "jobId": job["id"],
            "status": "applied",
            "applicationDate": fake.date_time_between(
                start_date="-30d", end_date="now"
            ).isoformat(),
        }

        return {
            "job": job,
            "candidate": candidate,
            "resume": resume,
            "application": application,
            "outcome": outcome,
        }

    def generate_comprehensive_training_dataset(self, total_examples=200):
        """
        Generate a comprehensive training dataset with diverse scenarios

        This creates a realistic mix of hiring outcomes:
        - 60% good matches (hired)
        - 25% poor matches (rejected)
        - 10% overqualified (rejected)
        - 5% underqualified (rejected)
        """

        print(f"🎯 Generating {total_examples} training examples...")
        print("📊 Distribution:")
        print(f"   • Good matches (hired): {int(total_examples * 0.6)}")
        print(f"   • Poor matches (rejected): {int(total_examples * 0.25)}")
        print(f"   • Overqualified (rejected): {int(total_examples * 0.10)}")
        print(f"   • Underqualified (rejected): {int(total_examples * 0.05)}")

        training_data = []

        # Generate examples based on realistic distribution
        scenario_distribution = [
            ("good_match", int(total_examples * 0.6)),
            ("poor_match", int(total_examples * 0.25)),
            ("overqualified", int(total_examples * 0.10)),
            ("underqualified", int(total_examples * 0.05)),
        ]

        for scenario_type, count in scenario_distribution:
            print(f"📝 Generating {count} {scenario_type} examples...")

            for i in range(count):
                try:
                    example = self.generate_training_example(scenario_type)
                    training_data.append(example)

                    if (i + 1) % 20 == 0:
                        print(
                            f"   ✅ Generated {i + 1}/{count} {scenario_type} examples"
                        )

                except Exception as e:
                    print(f"   ⚠️ Error generating example {i + 1}: {e}")
                    continue

        print(f"\n🎉 Successfully generated {len(training_data)} training examples!")
        return training_data

    def save_training_data(self, training_data, filename="training_data.json"):
        """Save training data to JSON file"""
        filepath = f"data/{filename}"

        # Create data directory if it doesn't exist
        import os

        os.makedirs("data", exist_ok=True)

        with open(filepath, "w") as f:
            json.dump(training_data, f, indent=2, default=str)

        print(f"💾 Training data saved to {filepath}")
        print(f"📈 Dataset statistics:")

        outcomes = {}
        categories = {}
        levels = {}

        for example in training_data:
            outcome = example["outcome"]
            outcomes[outcome] = outcomes.get(outcome, 0) + 1

            category = example["job"]["category"]
            categories[category] = categories.get(category, 0) + 1

            level = example["job"].get("level", "unknown")
            levels[level] = levels.get(level, 0) + 1

        print(f"   • Outcomes: {outcomes}")
        print(f"   • Categories: {categories}")
        print(f"   • Levels: {levels}")

        return filepath


# Example usage and testing
if __name__ == "__main__":
    generator = OptaHireSyntheticDataGenerator()

    print("🤖 OptaHire Synthetic Training Data Generator")
    print("=" * 60)

    # Generate comprehensive training dataset
    training_data = generator.generate_comprehensive_training_dataset(200)

    # Save to file
    filepath = generator.save_training_data(training_data)

    print(f"\n✅ Training data generation complete!")
    print(f"📁 File: {filepath}")
    print(f"🎯 Ready to train your AI model!")

    # Show a sample example
    print(f"\n📋 Sample Training Example:")
    sample = training_data[0]
    print(f"   Job: {sample['job']['title']} at {sample['job']['company']}")
    print(
        f"   Candidate: {sample['candidate']['firstName']} {sample['candidate']['lastName']}"
    )
    print(f"   Skills: {', '.join(sample['resume']['skills'][:3])}...")
    print(f"   Outcome: {sample['outcome']}")
    print(f"   Match Quality: {'Good' if sample['outcome'] == 'hired' else 'Poor'}")
