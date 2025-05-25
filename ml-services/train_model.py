import argparse
import json
import sys
import os
from pathlib import Path
import time
from colorama import Fore, Style, init
import psutil
from datetime import datetime

# Initialize colorama
init(autoreset=True)

# Add the ai-server directory to Python path
sys.path.insert(0, str(Path(__file__).parent))


def print_header(title, subtitle=None):
    """Print a formatted header"""
    print("\n" + Fore.YELLOW + "=" * 86)
    print(Fore.YELLOW + Style.BRIGHT + title)
    if subtitle:
        print(Fore.CYAN + subtitle)
    print(Fore.YELLOW + "=" * 86)


def print_section(title):
    """Print a section header"""
    print(f"\n{Fore.CYAN + Style.BRIGHT}{title}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'=' * len(title)}{Style.RESET_ALL}")


def print_step(step_num, title):
    """Print a step header"""
    print(
        f"\n{Fore.MAGENTA + Style.BRIGHT}🚀 Step {step_num}: {title}{Style.RESET_ALL}"
    )
    print(f"{Fore.MAGENTA}{'=' * (20 + len(title))}{Style.RESET_ALL}")


def print_success(message):
    """Print a success message"""
    print(f"{Fore.GREEN}✅ {message}{Style.RESET_ALL}")


def print_error(message):
    """Print an error message"""
    print(f"{Fore.RED}❌ {message}{Style.RESET_ALL}")


def print_warning(message):
    """Print a warning message"""
    print(f"{Fore.YELLOW}⚠️ {message}{Style.RESET_ALL}")


def print_info(message):
    """Print an info message"""
    print(f"{Fore.BLUE}ℹ️ {message}{Style.RESET_ALL}")


def print_progress(current, total, item_name="items"):
    """Print progress information"""
    print(f"{Fore.GREEN}   ✅ Processed {current}/{total} {item_name}{Style.RESET_ALL}")


def print_system_info():
    """Print system information"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()

        print(
            f"{Fore.BLUE}💾 Memory Usage: {memory.percent}% ({memory.used // (1024**2)}MB / {memory.total // (1024**2)}MB){Style.RESET_ALL}"
        )
        print(f"{Fore.BLUE}🖥️  CPU Usage:   {cpu_percent}%{Style.RESET_ALL}")
        print(
            f"{Fore.MAGENTA}⏰ Timestamp:   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}"
        )
    except Exception as e:
        print_warning(f"Could not retrieve system info: {e}")


def generate_training_data(num_examples=200):
    """Generate synthetic training data"""
    print_step(1, "Generating Synthetic Training Data")
    print_system_info()

    try:
        from data_generation.synthetic_data_generator import (
            OptaHireSyntheticDataGenerator,
        )

        print(f"{Fore.CYAN}🎯 Initializing data generator...{Style.RESET_ALL}")
        generator = OptaHireSyntheticDataGenerator()

        print(
            f"{Fore.CYAN}📊 Generating {num_examples} training examples...{Style.RESET_ALL}"
        )
        training_data = generator.generate_comprehensive_training_dataset(num_examples)

        print(f"{Fore.CYAN}💾 Saving training data...{Style.RESET_ALL}")
        filepath = generator.save_training_data(
            training_data, "optahire_training_data.json"
        )

        print_success(
            f"Training data generated successfully! ({len(training_data)} examples)"
        )
        print(f"{Fore.GREEN}📁 Saved to: {filepath}{Style.RESET_ALL}")
        return training_data, filepath

    except Exception as e:
        print_error(f"Error generating training data: {e}")
        return None, None


def load_training_data(filepath="data/optahire_training_data.json"):
    """Load training data from file"""
    try:
        if not os.path.exists(filepath):
            print_error(f"Training data file not found: {filepath}")
            print(
                f"{Fore.YELLOW}💡 Tip: Run with --data-only first to generate training data{Style.RESET_ALL}"
            )
            return None

        print(
            f"{Fore.CYAN}📂 Loading training data from {filepath}...{Style.RESET_ALL}"
        )
        with open(filepath, "r") as f:
            training_data = json.load(f)

        print_success(f"Loaded {len(training_data)} training examples")
        return training_data

    except Exception as e:
        print_error(f"Error loading training data: {e}")
        return None


def format_data_for_ai_model(training_data):
    """Format training data for the AI model"""
    print_step(2, "Formatting Data for AI Model")

    formatted_data = []
    total_examples = len(training_data)

    print(f"{Fore.CYAN}🔄 Processing {total_examples} examples...{Style.RESET_ALL}")

    for i, example in enumerate(training_data):
        try:
            # Format according to the AI model's expected input structure
            formatted_example = {
                "job": {
                    "id": example["job"]["id"],
                    "title": example["job"]["title"],
                    "description": example["job"]["description"],
                    "requirements": example["job"]["requirements"],
                    "category": example["job"]["category"],
                    "company": example["job"]["company"],
                },
                "candidate": {
                    "id": example["candidate"]["id"],
                    "firstName": example["candidate"]["firstName"],
                    "lastName": example["candidate"]["lastName"],
                    "email": example["candidate"]["email"],
                },
                "resume": {
                    "userId": example["resume"]["userId"],
                    "title": example["resume"]["title"],
                    "summary": example["resume"]["summary"],
                    "headline": example["resume"]["headline"],
                    "skills": example["resume"]["skills"],
                    "experience": example["resume"]["experience"],
                    "education": example["resume"]["education"],
                    "industry": example["resume"]["industry"],
                    "company": example["resume"]["company"],
                    "achievements": example["resume"]["achievements"],
                },
                "outcome": example["outcome"],
            }

            formatted_data.append(formatted_example)

            if (i + 1) % 50 == 0:
                print_progress(i + 1, total_examples, "examples")

        except Exception as e:
            print_warning(f"Error formatting example {i + 1}: {e}")
            continue

    print_success(
        f"Successfully formatted {len(formatted_data)} examples for AI training"
    )
    return formatted_data


def train_ai_model(formatted_data):
    """Train the AI model with formatted data"""
    print_step(3, "Training AI Model")

    try:
        # Import AI model
        from models.candidate_matcher import CandidateMatcher

        print(f"{Fore.CYAN}🤖 Initializing AI model...{Style.RESET_ALL}")
        matcher = CandidateMatcher()

        print(
            f"{Fore.YELLOW}🎓 Starting model training with {len(formatted_data)} examples...{Style.RESET_ALL}"
        )
        print_system_info()

        start_time = time.time()

        # Train the model
        training_results = matcher.train_model(formatted_data)

        training_time = time.time() - start_time

        print_success(f"Model training completed in {training_time:.2f} seconds!")

        print(f"\n{Fore.MAGENTA + Style.BRIGHT}📊 TRAINING RESULTS{Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}{'=' * 40}{Style.RESET_ALL}")
        for key, value in training_results.items():
            print(f"{Fore.WHITE}   • {key}: {Fore.CYAN}{value}{Style.RESET_ALL}")

        return True, training_results

    except Exception as e:
        print_error(f"Error training AI model: {e}")
        print(f"{Fore.RED}🔍 Full error details:{Style.RESET_ALL}")
        import traceback

        traceback.print_exc()
        return False, None


def test_trained_model():
    """Test the trained model with a sample prediction"""
    print_step(4, "Testing Trained Model")

    try:
        from models.candidate_matcher import CandidateMatcher

        print(f"{Fore.CYAN}🔍 Initializing trained model...{Style.RESET_ALL}")
        matcher = CandidateMatcher()

        if not matcher.is_trained:
            print_error("Model is not trained! Training may have failed.")
            return False

        print_success("Model is trained and ready!")

        print(f"\n{Fore.MAGENTA + Style.BRIGHT}📈 MODEL CONFIGURATION{Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}{'=' * 40}{Style.RESET_ALL}")
        print(
            f"{Fore.WHITE}   • Scoring Weights: {Fore.CYAN}{matcher.weights}{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   • Text Vectorizer: {Fore.GREEN + '✅ Ready' if matcher.text_vectorizer else Fore.RED + '❌ Missing'}{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   • Skills Vectorizer: {Fore.GREEN + '✅ Ready' if matcher.skills_vectorizer else Fore.RED + '❌ Missing'}{Style.RESET_ALL}"
        )

        # Create a simple test case
        test_job = {
            "id": "test-job-1",
            "title": "Frontend Developer",
            "description": "We are looking for a skilled Frontend Developer to join our team.",
            "requirements": "Required skills: JavaScript, React, HTML, CSS. 2+ years experience.",
            "category": "IT",
            "company": "Test Company",
        }

        test_applications = [
            {
                "id": "test-app-1",
                "candidateId": "test-candidate-1",
                "status": "applied",
                "candidate": {
                    "id": "test-candidate-1",
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@example.com",
                },
                "resume": {
                    "userId": "test-candidate-1",
                    "title": "Frontend Developer",
                    "summary": "Experienced frontend developer with React expertise",
                    "skills": ["JavaScript", "React", "HTML", "CSS", "Node.js"],
                    "experience": "Frontend Developer with 3 years of experience building React applications.",
                    "education": "Bachelor's Degree in Computer Science",
                    "industry": "IT",
                    "company": "Previous Tech Company",
                },
            }
        ]

        print(
            f"\n{Fore.YELLOW + Style.BRIGHT}🧪 RUNNING TEST PREDICTION{Style.RESET_ALL}"
        )
        print(f"{Fore.YELLOW}{'=' * 40}{Style.RESET_ALL}")
        print(f"{Fore.WHITE}   📋 Job: {Fore.CYAN}{test_job['title']}{Style.RESET_ALL}")
        print(
            f"{Fore.WHITE}   👤 Candidate: {Fore.CYAN}{test_applications[0]['candidate']['firstName']} {test_applications[0]['candidate']['lastName']}{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   🛠️  Skills: {Fore.CYAN}{', '.join(test_applications[0]['resume']['skills'])}{Style.RESET_ALL}"
        )

        # Test the shortlisting
        results = matcher.shortlist_candidates(test_job, test_applications)

        if results:
            candidate = results[0]
            print(f"\n{Fore.MAGENTA + Style.BRIGHT}📊 TEST RESULTS{Style.RESET_ALL}")
            print(f"{Fore.MAGENTA}{'=' * 40}{Style.RESET_ALL}")
            print(
                f"{Fore.WHITE}   • Total Score: {Fore.GREEN}{candidate['total_score']:.3f}{Style.RESET_ALL}"
            )
            print(
                f"{Fore.WHITE}   • Recommendation: {Fore.GREEN}{candidate['recommendation_strength']}{Style.RESET_ALL}"
            )
            print(
                f"{Fore.WHITE}   • Explanation: {Fore.CYAN}{candidate['match_explanation'][:100]}...{Style.RESET_ALL}"
            )

            print_success("Model test successful! AI is ready to shortlist candidates.")
        else:
            print_warning("No results returned from test prediction")

        return True

    except Exception as e:
        print_error(f"Error testing model: {e}")
        import traceback

        traceback.print_exc()
        return False


def print_final_results(success, training_data=None):
    """Print final pipeline results"""
    print(
        f"\n{Fore.YELLOW + Style.BRIGHT}🏁 TRAINING PIPELINE COMPLETE{Style.RESET_ALL}"
    )
    print(f"{Fore.YELLOW}{'=' * 86}{Style.RESET_ALL}")
    print(
        f"{Fore.MAGENTA}⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}"
    )
    print_system_info()

    if success:
        print(
            f"\n{Fore.GREEN + Style.BRIGHT}🎉 SUCCESS: Your OptaHire AI model is trained and ready!{Style.RESET_ALL}"
        )

        print(f"\n{Fore.CYAN + Style.BRIGHT}📋 NEXT STEPS{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'=' * 40}{Style.RESET_ALL}")
        print(
            f"{Fore.WHITE}   1. {Fore.YELLOW}Start your AI server:{Fore.CYAN} python app.py{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   2. {Fore.YELLOW}Start your Node.js server{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   3. {Fore.YELLOW}Test the integration with a job posting{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   4. {Fore.YELLOW}Use the AI shortlisting in your recruitment platform!{Style.RESET_ALL}"
        )

        if training_data:
            hired_count = sum(1 for ex in training_data if ex["outcome"] == "hired")
            print(
                f"\n{Fore.MAGENTA + Style.BRIGHT}📊 TRAINING DATA SUMMARY{Style.RESET_ALL}"
            )
            print(f"{Fore.MAGENTA}{'=' * 40}{Style.RESET_ALL}")
            print(
                f"{Fore.WHITE}   • Total examples: {Fore.CYAN}{len(training_data)}{Style.RESET_ALL}"
            )
            print(
                f"{Fore.WHITE}   • Successful hires: {Fore.GREEN}{hired_count}{Style.RESET_ALL}"
            )
            print(
                f"{Fore.WHITE}   • Rejection cases: {Fore.RED}{len(training_data) - hired_count}{Style.RESET_ALL}"
            )
    else:
        print(
            f"\n{Fore.RED + Style.BRIGHT}❌ FAILED: Training pipeline encountered errors{Style.RESET_ALL}"
        )

        print(f"\n{Fore.YELLOW + Style.BRIGHT}🔧 TROUBLESHOOTING{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}{'=' * 40}{Style.RESET_ALL}")
        print(
            f"{Fore.WHITE}   1. {Fore.CYAN}Check dependencies: pip install -r requirements.txt{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   2. {Fore.CYAN}Ensure you're in the ai-server directory{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   3. {Fore.CYAN}Check the error messages above for specific issues{Style.RESET_ALL}"
        )
        print(
            f"{Fore.WHITE}   4. {Fore.CYAN}Try running individual steps with --data-only or --train-only{Style.RESET_ALL}"
        )

    print(f"{Fore.YELLOW}{'=' * 86}{Style.RESET_ALL}")


def main():
    """Main training pipeline"""
    parser = argparse.ArgumentParser(description="Train OptaHire AI Model")
    parser.add_argument(
        "--data-only",
        action="store_true",
        help="Only generate training data, skip training",
    )
    parser.add_argument(
        "--train-only",
        action="store_true",
        help="Only train model, skip data generation",
    )
    parser.add_argument(
        "--examples",
        type=int,
        default=200,
        help="Number of training examples to generate (default: 200)",
    )
    parser.add_argument(
        "--test-only", action="store_true", help="Only test existing trained model"
    )

    args = parser.parse_args()

    print_header(
        "🤖 OPTAHIRE AI MODEL TRAINING PIPELINE",
        f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    )
    print_system_info()

    # Create necessary directories
    os.makedirs("data", exist_ok=True)
    os.makedirs("data/models", exist_ok=True)
    os.makedirs("data_generation", exist_ok=True)

    training_data = None
    success = True

    try:
        if args.test_only:
            # Only test the model
            success = test_trained_model()

        elif args.train_only:
            # Only train model with existing data
            training_data = load_training_data()
            if training_data:
                formatted_data = format_data_for_ai_model(training_data)
                if formatted_data:
                    success, results = train_ai_model(formatted_data)
                    if success:
                        success = test_trained_model()
                else:
                    success = False
            else:
                success = False

        elif args.data_only:
            # Only generate training data
            training_data, filepath = generate_training_data(args.examples)
            success = training_data is not None

        else:
            # Full pipeline: generate data and train model
            print_info("Running full training pipeline...")

            # Step 1: Generate training data
            training_data, filepath = generate_training_data(args.examples)
            if not training_data:
                success = False
            else:
                # Step 2: Format data for AI model
                formatted_data = format_data_for_ai_model(training_data)
                if not formatted_data:
                    success = False
                else:
                    # Step 3: Train the model
                    success, results = train_ai_model(formatted_data)
                    if success:
                        # Step 4: Test the model
                        success = test_trained_model()

        # Final results
        print_final_results(success, training_data)

    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}⏹️ Training interrupted by user{Style.RESET_ALL}")
        success = False
    except Exception as e:
        print_error(f"Unexpected error in training pipeline: {e}")
        import traceback

        traceback.print_exc()
        success = False

    return 0 if success else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
