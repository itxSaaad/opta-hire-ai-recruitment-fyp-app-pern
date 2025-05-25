from typing import List, Dict, Any
import re


def validate_job_data(job_data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate job description data structure

    Args:
        job_data: Dictionary containing job information

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["id", "title", "description", "requirements", "category"]

    for field in required_fields:
        if field not in job_data or not job_data[field]:
            return False, f"Missing required field: {field}"

    # Validate data types and content
    if not isinstance(job_data["title"], str) or len(job_data["title"].strip()) < 2:
        return False, "Job title must be a non-empty string"

    if (
        not isinstance(job_data["description"], str)
        or len(job_data["description"].strip()) < 50
    ):
        return False, "Job description must be at least 50 characters"

    return True, ""


def validate_resume_data(resume_data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate resume data structure

    Args:
        resume_data: Dictionary containing resume information

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["userId", "skills", "experience", "education"]

    for field in required_fields:
        if field not in resume_data:
            return False, f"Missing required field: {field}"

    # Validate skills array
    if (
        not isinstance(resume_data.get("skills"), list)
        or len(resume_data["skills"]) == 0
    ):
        return False, "Skills must be a non-empty array"

    # Validate experience and education are strings
    if (
        not isinstance(resume_data.get("experience"), str)
        or len(resume_data["experience"].strip()) < 10
    ):
        return False, "Experience must be a detailed string"

    if (
        not isinstance(resume_data.get("education"), str)
        or len(resume_data["education"].strip()) < 5
    ):
        return False, "Education must be a non-empty string"

    return True, ""


def validate_application_data(application_data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate application data structure

    Args:
        application_data: Dictionary containing application information

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["id", "candidateId", "status"]

    for field in required_fields:
        if field not in application_data:
            return False, f"Missing required field: {field}"

    # Validate status
    valid_statuses = ["applied", "shortlisted", "rejected", "hired"]
    if application_data["status"] not in valid_statuses:
        return False, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"

    # Validate that candidate and resume data exists
    if "candidate" not in application_data:
        return False, "Missing candidate information"

    if "resume" not in application_data:
        return False, "Missing resume information"

    # Validate nested resume data
    resume_valid, resume_error = validate_resume_data(application_data["resume"])
    if not resume_valid:
        return False, f"Invalid resume data: {resume_error}"

    return True, ""


def validate_shortlisting_data(
    job_data: Dict[str, Any], applications: List[Dict[str, Any]]
) -> tuple[bool, str, List[Dict[str, Any]]]:
    """
    Validate complete shortlisting request data and filter valid applications

    Args:
        job_data: Dictionary containing job information
        applications: List of application dictionaries

    Returns:
        Tuple of (is_valid, error_message, valid_applications)
    """
    # Validate job data
    job_valid, job_error = validate_job_data(job_data)
    if not job_valid:
        return False, f"Invalid job data: {job_error}", []

    if not applications or not isinstance(applications, list):
        return False, "Applications must be a non-empty list", []

    valid_applications = []
    validation_errors = []

    for i, application in enumerate(applications):
        try:
            app_valid, app_error = validate_application_data(application)
            if app_valid:
                valid_applications.append(application)
            else:
                validation_errors.append(f"Application {i+1}: {app_error}")
        except Exception as e:
            validation_errors.append(f"Application {i+1}: Validation error - {str(e)}")

    if not valid_applications:
        error_summary = "; ".join(validation_errors[:3])  # Show first 3 errors
        if len(validation_errors) > 3:
            error_summary += f"... and {len(validation_errors) - 3} more"
        return False, f"No valid applications found. Errors: {error_summary}", []

    return True, "", valid_applications


def sanitize_text(text: str) -> str:
    """
    Clean and sanitize text input for AI processing

    Args:
        text: Raw text input

    Returns:
        Cleaned text ready for processing
    """
    if not isinstance(text, str):
        return ""

    # Remove extra whitespace and normalize
    text = re.sub(r"\s+", " ", text.strip())

    # Remove potentially harmful characters
    text = re.sub(r'[^\w\s\-.,;:()[\]{}!?@#$%&*+=<>/\\"|\'`~]', "", text)

    return text
