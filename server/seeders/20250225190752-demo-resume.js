'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const resumes = [
      {
        id: '10000000-0000-0000-0000-000000000003',
        title: 'Senior Technical Interviewer & Full-Stack Assessment Expert',
        summary:
          'Experienced technical interviewer with over 6 years of expertise in conducting comprehensive software engineering assessments. Specialized in full-stack development evaluation, system design interviews, and candidate technical competency analysis across multiple programming languages and frameworks.',
        headline:
          'Senior Technical Interviewer | Full-Stack Development Specialist',
        skills: [
          'Technical Interviewing',
          'Candidate Assessment',
          'JavaScript',
          'React',
          'Node.js',
          'System Design',
          'Algorithm Review',
          'Database Design',
          'API Development',
          'Code Review',
        ],
        experience:
          'Led over 400 technical interviews for various tech companies including startups and Fortune 500 companies. Specialized in evaluating full-stack developers, backend engineers, and frontend specialists. Developed standardized interview frameworks that improved candidate selection accuracy by 40%.',
        education:
          'Master of Science in Computer Science from University of Engineering & Technology, Lahore. Bachelor of Science in Software Engineering.',
        industry: 'Technology',
        availability: 'Full-Time',
        company: 'TechInterview Solutions',
        achievements:
          'Successfully assessed and recommended candidates with 95% accuracy rate. Developed interview question banks used by 15+ companies. Mentored 20+ junior interviewers. Published technical interview best practices guide.',
        rating: 4.8,
        portfolio: 'https://hassaan-interviewer.portfolio.com',
        userId: '00000000-0000-0000-0000-000000000003',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        title: 'Principal System Design Interviewer & Architecture Specialist',
        summary:
          'Veteran technical interviewer with deep expertise in system design, distributed systems architecture, and senior-level technical assessments. Over 8 years of experience conducting high-level technical interviews for principal and staff engineer positions at leading technology companies.',
        headline:
          'Principal System Design Interviewer | Distributed Systems Expert',
        skills: [
          'System Design',
          'Distributed Systems',
          'Architecture Review',
          'Technical Leadership',
          'Scalability Assessment',
          'Cloud Technologies',
          'Microservices',
          'Database Systems',
          'Performance Optimization',
          'Technical Mentoring',
        ],
        experience:
          'Over 8 years conducting senior-level technical interviews focusing on system design and architecture for companies like Google, Microsoft, and various unicorn startups. Expert in evaluating candidates for Staff, Principal, and Distinguished Engineer roles.',
        education:
          'Master of Engineering in Software Engineering from LUMS. Bachelor of Computer Science from FAST University.',
        industry: 'Technology',
        availability: 'Part-Time',
        company: 'Elite Tech Interviews',
        achievements:
          'Conducted over 600 system design interviews with 98% positive feedback. Developed system design interview frameworks used by top tech companies. Speaker at 10+ technical conferences. Published research on scalable system architectures.',
        rating: 4.9,
        portfolio: 'https://hasnain-systemdesign.portfolio.com',
        userId: '00000000-0000-0000-0000-000000000004',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        title: 'Full-Stack Software Developer & React Specialist',
        summary:
          'Passionate full-stack software developer with 3+ years of hands-on experience in modern web technologies. Strong foundation in computer science with expertise in React, Node.js, and cloud technologies. Proven track record of building scalable web applications and contributing to open-source projects.',
        headline:
          'Full-Stack Developer | React & Node.js Expert | Open Source Contributor',
        skills: [
          'JavaScript',
          'TypeScript',
          'React',
          'Next.js',
          'Node.js',
          'Express.js',
          'PostgreSQL',
          'MongoDB',
          'REST APIs',
          'GraphQL',
          'Docker',
          'AWS',
          'Git',
          'Agile Development',
        ],
        experience:
          'Developed and maintained 8+ full-stack applications using React, Node.js, and various database technologies. Led frontend development for 2 major projects serving 10,000+ users. Contributed to 15+ open-source projects with combined 2,000+ GitHub stars.',
        education:
          'Bachelor of Science in Computer Science from University of the Punjab, Lahore. Completed advanced courses in React, Node.js, and Cloud Computing.',
        industry: 'Technology',
        availability: 'Immediate',
        company: null,
        achievements:
          'Built 8+ production applications serving 25,000+ users. Contributed to popular open-source projects with 2,000+ GitHub stars. Won 2nd place in national hackathon. Mentored 5+ junior developers.',
        rating: null,
        portfolio: 'https://umair-developer.portfolio.com',
        userId: '00000000-0000-0000-0000-000000000005',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        title: 'DevOps Engineer & Cloud Infrastructure Specialist',
        summary:
          'Experienced DevOps engineer with 4+ years of expertise in cloud infrastructure, containerization, and CI/CD pipeline automation. Strong background in AWS services, Kubernetes orchestration, and infrastructure as code. Passionate about building reliable, scalable, and secure cloud-native applications.',
        headline:
          'DevOps Engineer | AWS Certified | Kubernetes & Docker Expert',
        skills: [
          'Python',
          'Bash Scripting',
          'AWS',
          'Docker',
          'Kubernetes',
          'Terraform',
          'Jenkins',
          'CI/CD',
          'Linux',
          'Monitoring',
          'Prometheus',
          'Grafana',
          'ELK Stack',
          'Infrastructure as Code',
        ],
        experience:
          '4+ years in DevOps and cloud infrastructure, specializing in AWS services and containerized applications. Managed infrastructure for applications serving 500,000+ users. Implemented CI/CD pipelines that reduced deployment time by 75% and improved system reliability.',
        education:
          'Bachelor of Science in Software Engineering from COMSATS University. AWS Certified Solutions Architect and DevOps Engineer certifications.',
        industry: 'Technology',
        availability: 'Two weeks',
        company: null,
        achievements:
          'Reduced deployment time by 75% through CI/CD automation. Managed infrastructure for applications serving 500,000+ users. Achieved 99.9% uptime across production systems. Led cloud migration projects saving 40% in infrastructure costs.',
        rating: null,
        portfolio: 'https://adnan-devops.portfolio.com',
        userId: '00000000-0000-0000-0000-000000000006',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Resumes', resumes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Resumes', null, {});
  },
};
