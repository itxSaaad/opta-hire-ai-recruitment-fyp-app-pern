'use strict';

const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    // Helper function to ensure proper date ranges
    const ensureDateRange = (fromDate, toDate, minDifferenceHours = 24) => {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Ensure from is before to with minimum difference
      if (from.getTime() >= to.getTime()) {
        to.setTime(from.getTime() + minDifferenceHours * 60 * 60 * 1000);
      } else if (
        to.getTime() - from.getTime() <
        minDifferenceHours * 60 * 60 * 1000
      ) {
        to.setTime(from.getTime() + minDifferenceHours * 60 * 60 * 1000);
      }

      return { from, to };
    };

    // Helper function for safe date generation
    const safeDateBetween = (fromDate, toDate, minDifferenceHours = 24) => {
      const { from, to } = ensureDateRange(
        fromDate,
        toDate,
        minDifferenceHours
      );
      return faker.date.between({ from, to });
    };

    // Check existing data to avoid duplicates
    const existingData = await queryInterface.sequelize.query(
      `SELECT email, phone FROM "Users"
       WHERE email IN (
         'admin@optahire.com',
         'recruiter@optahire.com', 
         'interviewer@optahire.com',
         'interviewer2@optahire.com',
         'candidate@optahire.com',
         'candidate2@optahire.com'
       );`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const usedEmails = new Set(existingData.map((u) => u.email.toLowerCase()));
    const usedPhones = new Set(existingData.map((u) => u.phone));

    // Enhanced time periods for realistic patterns
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Current time minus 1 hour to avoid future dates
    const now = new Date();
    now.setHours(now.getHours() - 1);

    // Enhanced industry mappings with more sophisticated data
    const industries = [
      {
        name: 'Technology',
        growthRate: 'high',
        averageSalary: { min: 80, max: 220 },
        skills: [
          'JavaScript',
          'TypeScript',
          'React',
          'Vue.js',
          'Angular',
          'HTML5',
          'CSS3',
          'SASS',
          'Webpack',
          'Next.js',
          'Nuxt.js',
          'Node.js',
          'Python',
          'Java',
          'C#',
          'Go',
          'Rust',
          'PHP',
          'Ruby',
          'Express.js',
          'Django',
          'Flask',
          'Spring Boot',
          'ASP.NET',
          'PostgreSQL',
          'MongoDB',
          'MySQL',
          'Redis',
          'Elasticsearch',
          'Cassandra',
          'DynamoDB',
          'AWS',
          'Azure',
          'GCP',
          'Docker',
          'Kubernetes',
          'Jenkins',
          'GitLab CI',
          'Terraform',
          'Ansible',
          'Linux',
          'CI/CD',
          'Machine Learning',
          'Deep Learning',
          'TensorFlow',
          'PyTorch',
          'Scikit-learn',
          'Pandas',
          'NumPy',
          'Data Science',
          'React Native',
          'Flutter',
          'Swift',
          'Kotlin',
          'iOS Development',
          'Android Development',
          'GraphQL',
          'REST APIs',
          'Microservices',
          'System Design',
          'Agile',
          'Scrum',
          'Git',
          'Testing',
          'Security',
        ],
        jobTitles: [
          'Software Engineer',
          'Senior Software Engineer',
          'Staff Software Engineer',
          'Principal Engineer',
          'Full Stack Developer',
          'Frontend Developer',
          'Backend Developer',
          'Mobile Developer',
          'DevOps Engineer',
          'Site Reliability Engineer',
          'Cloud Engineer',
          'Solutions Architect',
          'Data Scientist',
          'ML Engineer',
          'Data Engineer',
          'AI Researcher',
          'Product Manager',
          'Technical Lead',
          'Engineering Manager',
          'CTO',
          'QA Engineer',
          'Security Engineer',
          'Database Administrator',
          'Platform Engineer',
        ],
        companies: [
          'TechCorp Solutions',
          'InnovateTech',
          'CloudFirst Inc',
          'DataDriven Systems',
          'NextGen Software',
          'QuantumLeap Technologies',
          'CyberSecure Solutions',
          'AIVentures',
          'MicroServices Co',
          'CloudNative Systems',
          'DevOps Masters',
          'ScaleUp Tech',
        ],
        locations: [
          'San Francisco, CA',
          'Seattle, WA',
          'Austin, TX',
          'New York, NY',
          'Remote',
          'Hybrid',
        ],
      },
      {
        name: 'Finance',
        growthRate: 'medium',
        averageSalary: { min: 70, max: 200 },
        skills: [
          'Financial Analysis',
          'Risk Management',
          'Investment Banking',
          'Trading',
          'Portfolio Management',
          'Financial Modeling',
          'Valuation',
          'Derivatives',
          'Fixed Income',
          'Equity Research',
          'Corporate Finance',
          'M&A',
          'Private Equity',
          'Venture Capital',
          'Hedge Funds',
          'Compliance',
          'Regulatory Reporting',
          'AML',
          'KYC',
          'Basel III',
          'IFRS',
          'GAAP',
          'Python',
          'R',
          'SQL',
          'Excel VBA',
          'MATLAB',
          'Bloomberg Terminal',
          'FactSet',
          'Credit Analysis',
          'Market Risk',
          'Operational Risk',
          'Stress Testing',
          'Quantitative Analysis',
          'Algorithmic Trading',
          'FinTech',
          'Blockchain',
          'DeFi',
        ],
        jobTitles: [
          'Financial Analyst',
          'Senior Financial Analyst',
          'Investment Banker',
          'Vice President',
          'Portfolio Manager',
          'Risk Manager',
          'Quantitative Analyst',
          'Research Analyst',
          'Trading Specialist',
          'Sales Trader',
          'Credit Analyst',
          'Compliance Officer',
          'Financial Controller',
          'Treasury Manager',
          'Investment Advisor',
          'Wealth Manager',
          'Private Banker',
          'Relationship Manager',
          'Product Manager',
          'Chief Risk Officer',
        ],
        companies: [
          'Goldman Sachs',
          'Morgan Stanley',
          'JPMorgan Chase',
          'Bank of America',
          'Wells Fargo',
          'Citigroup',
          'BlackRock',
          'Vanguard',
          'Fidelity',
          'Regional Banking Corp',
          'Investment Partners LLC',
          'FinTech Solutions',
          'Quantitative Capital',
          'Risk Analytics Corp',
          'Trading Systems Inc',
        ],
        locations: [
          'New York, NY',
          'London, UK',
          'Chicago, IL',
          'Boston, MA',
          'Charlotte, NC',
          'Remote',
        ],
      },
      {
        name: 'Healthcare',
        growthRate: 'high',
        averageSalary: { min: 60, max: 180 },
        skills: [
          'Clinical Research',
          'Medical Coding',
          'Patient Care',
          'Healthcare Management',
          'Nursing',
          'Pharmacology',
          'Medical Ethics',
          'HIPAA Compliance',
          'GCP',
          'FDA Regulations',
          'Electronic Health Records',
          'Epic',
          'Cerner',
          'Telemedicine',
          'Digital Health',
          'Public Health',
          'Epidemiology',
          'Biostatistics',
          'Clinical Data Management',
          'Medical Device Development',
          'Regulatory Affairs',
          'Quality Assurance',
          'Pharmacovigilance',
          'Healthcare Analytics',
          'Medical Writing',
          'Clinical Operations',
          'CRO Management',
          'Healthcare IT',
          'Interoperability',
          'HL7',
          'FHIR',
          'Medical Imaging',
          'AI in Healthcare',
        ],
        jobTitles: [
          'Clinical Research Coordinator',
          'Clinical Research Associate',
          'Clinical Data Manager',
          'Regulatory Affairs Specialist',
          'Medical Writer',
          'Biostatistician',
          'Healthcare Data Analyst',
          'Clinical Operations Manager',
          'Medical Device Engineer',
          'Healthcare IT Specialist',
          'Clinical Quality Assurance',
          'Pharmacovigilance Specialist',
          'Medical Affairs Manager',
          'Health Economics Researcher',
          'Digital Health Product Manager',
        ],
        companies: [
          'MediCare Solutions',
          'HealthFirst Systems',
          'PharmaTech Corp',
          'Clinical Research Partners',
          'HealthData Analytics',
          'Medical Device Innovations',
          'Digital Health Solutions',
          'Biotech Research Inc',
          'Healthcare AI Corp',
          'Telemedicine Platform',
        ],
        locations: [
          'Boston, MA',
          'San Francisco, CA',
          'Research Triangle, NC',
          'Philadelphia, PA',
          'Remote',
        ],
      },
      {
        name: 'Marketing',
        growthRate: 'medium',
        averageSalary: { min: 50, max: 140 },
        skills: [
          'Digital Marketing',
          'Content Marketing',
          'SEO',
          'SEM',
          'Social Media Marketing',
          'Email Marketing',
          'Marketing Automation',
          'Growth Hacking',
          'Performance Marketing',
          'Google Analytics',
          'Google Ads',
          'Facebook Ads',
          'LinkedIn Ads',
          'TikTok Ads',
          'Marketing Attribution',
          'Customer Acquisition',
          'Retention Marketing',
          'Lifecycle Marketing',
          'Brand Management',
          'Product Marketing',
          'Influencer Marketing',
          'Affiliate Marketing',
          'CRM',
          'Salesforce',
          'HubSpot',
          'Marketo',
          'Mailchimp',
          'Klaviyo',
          'A/B Testing',
          'Conversion Optimization',
          'Marketing Analytics',
          'Customer Segmentation',
          'Copywriting',
          'Creative Strategy',
          'Video Marketing',
          'Podcast Marketing',
        ],
        jobTitles: [
          'Digital Marketing Manager',
          'Growth Marketing Manager',
          'Performance Marketing Manager',
          'Content Marketing Manager',
          'SEO Specialist',
          'SEM Specialist',
          'Social Media Manager',
          'Email Marketing Specialist',
          'Marketing Automation Manager',
          'Brand Manager',
          'Product Marketing Manager',
          'Customer Acquisition Manager',
          'Marketing Analyst',
          'Creative Director',
          'Copywriter',
          'Marketing Operations Manager',
        ],
        companies: [
          'Creative Agency Pro',
          'Digital Marketing Hub',
          'Brand Builders Inc',
          'Growth Partners',
          'Social Media Masters',
          'Performance Marketing Co',
          'Content Creation Studios',
          'Influencer Network',
          'Marketing Automation Platform',
          'Brand Strategy Group',
        ],
        locations: [
          'New York, NY',
          'Los Angeles, CA',
          'Chicago, IL',
          'Atlanta, GA',
          'Remote',
          'Hybrid',
        ],
      },
      {
        name: 'Design',
        growthRate: 'medium',
        averageSalary: { min: 55, max: 150 },
        skills: [
          'UI/UX Design',
          'Product Design',
          'User Research',
          'Design Systems',
          'Prototyping',
          'Figma',
          'Sketch',
          'Adobe Creative Suite',
          'InVision',
          'Principle',
          'Framer',
          'Wireframing',
          'Information Architecture',
          'Interaction Design',
          'Visual Design',
          'Usability Testing',
          'A/B Testing',
          'Design Thinking',
          'Human-Centered Design',
          'Graphic Design',
          'Branding',
          'Typography',
          'Illustration',
          'Motion Graphics',
          'Web Design',
          'Mobile Design',
          'Responsive Design',
          'Accessibility',
          'Design Ops',
          '3D Design',
          'Animation',
          'Video Editing',
          'Photography',
          'Print Design',
        ],
        jobTitles: [
          'UX Designer',
          'UI Designer',
          'Product Designer',
          'Senior Product Designer',
          'UX Researcher',
          'Design Systems Designer',
          'Visual Designer',
          'Interaction Designer',
          'Graphic Designer',
          'Brand Designer',
          'Motion Graphics Designer',
          'Web Designer',
          'Art Director',
          'Creative Director',
          'Design Manager',
          'Head of Design',
        ],
        companies: [
          'Design Studio Pro',
          'Creative Solutions Inc',
          'User Experience Labs',
          'Brand Design Agency',
          'Digital Design Co',
          'Product Design Consultancy',
          'Creative Technology Studio',
          'Design Systems Company',
          'Visual Arts Collective',
          'Innovation Design Lab',
        ],
        locations: [
          'San Francisco, CA',
          'New York, NY',
          'Los Angeles, CA',
          'Portland, OR',
          'Remote',
        ],
      },
    ];

    // Global locations with realistic distribution
    const globalLocations = [
      {
        city: 'San Francisco, CA',
        weight: 15,
        timezone: 'PST',
        market: 'tech',
      },
      { city: 'Seattle, WA', weight: 10, timezone: 'PST', market: 'tech' },
      { city: 'Austin, TX', weight: 8, timezone: 'CST', market: 'tech' },
      { city: 'New York, NY', weight: 12, timezone: 'EST', market: 'finance' },
      { city: 'Boston, MA', weight: 6, timezone: 'EST', market: 'healthcare' },
      {
        city: 'Los Angeles, CA',
        weight: 8,
        timezone: 'PST',
        market: 'entertainment',
      },
      { city: 'Chicago, IL', weight: 6, timezone: 'CST', market: 'finance' },
      { city: 'Denver, CO', weight: 4, timezone: 'MST', market: 'tech' },
      { city: 'London, UK', weight: 8, timezone: 'GMT', market: 'finance' },
      { city: 'Toronto, ON', weight: 5, timezone: 'EST', market: 'tech' },
      { city: 'Vancouver, BC', weight: 3, timezone: 'PST', market: 'tech' },
      { city: 'Berlin, Germany', weight: 4, timezone: 'CET', market: 'tech' },
      {
        city: 'Amsterdam, Netherlands',
        weight: 3,
        timezone: 'CET',
        market: 'tech',
      },
      { city: 'Singapore', weight: 4, timezone: 'SGT', market: 'finance' },
      {
        city: 'Sydney, Australia',
        weight: 3,
        timezone: 'AEDT',
        market: 'tech',
      },
      { city: 'Remote', weight: 20, timezone: 'various', market: 'all' },
      { city: 'Hybrid', weight: 15, timezone: 'various', market: 'all' },
    ];

    const availabilities = [
      'Immediate',
      'Two weeks',
      'One month',
      'More than a month',
    ];
    const contractStatuses = ['pending', 'active', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const applicationStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];
    const interviewStatuses = [
      'scheduled',
      'ongoing',
      'completed',
      'cancelled',
    ];
    const transactionTypes = ['payment', 'refund', 'payout', 'platform_fee'];
    const transactionStatuses = [
      'pending',
      'completed',
      'failed',
      'cancelled',
      'refunded',
    ];

    // Helper function to generate weighted random choice
    const weightedRandomChoice = (items) => {
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
      }
      return items[items.length - 1];
    };

    // Enhanced salary range generation with market factors
    const generateSalaryRange = (industry, location, experienceLevel) => {
      const baseRange = industry.averageSalary;
      let multiplier = 1;

      const locationMultipliers = {
        'San Francisco, CA': 1.4,
        'New York, NY': 1.3,
        'Seattle, WA': 1.25,
        'Boston, MA': 1.2,
        'London, UK': 1.15,
        Remote: 1.0,
        Hybrid: 1.05,
      };

      const experienceMultipliers = {
        Entry: 0.8,
        Junior: 0.9,
        'Mid-level': 1.0,
        Senior: 1.3,
        Lead: 1.5,
        Principal: 1.8,
        Staff: 1.6,
        Director: 2.0,
      };

      multiplier *= locationMultipliers[location] || 1;
      multiplier *= experienceMultipliers[experienceLevel] || 1;

      const minSalary = Math.round(baseRange.min * multiplier);
      const maxSalary = Math.round(baseRange.max * multiplier);

      return `$${minSalary}k - $${maxSalary}k`;
    };

    // Generate hiring season patterns
    const getHiringSeasonMultiplier = (date) => {
      const month = date.getMonth() + 1;
      if (month >= 1 && month <= 3) return 1.3;
      if (month >= 4 && month <= 6) return 0.9;
      if (month >= 7 && month <= 9) return 1.2;
      return 0.8;
    };

    // Helper function to generate unique emails and phones
    const generateUniqueContact = (
      firstName,
      lastName,
      usedEmails,
      usedPhones,
      maxAttempts = 15
    ) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        const phone = faker.helpers.arrayElement([
          faker.phone.number('+1##########'),
          faker.phone.number('+44##########'),
          faker.phone.number('+1-###-###-####'),
        ]);

        if (!usedEmails.has(email) && !usedPhones.has(phone)) {
          usedEmails.add(email);
          usedPhones.add(phone);
          return { email, phone };
        }
      }
      return null;
    };

    // Create synthetic users with enhanced realism
    const users = [];

    // Generate 30 recruiters
    for (let i = 0; i < 30; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const contact = generateUniqueContact(
        firstName,
        lastName,
        usedEmails,
        usedPhones
      );

      if (!contact) continue;

      const createdAt = safeDateBetween(sixMonthsAgo, now);

      const user = {
        firstName,
        lastName,
        email: contact.email,
        phone: contact.phone,
        password: await hashPassword('Password@123'),
        otp: null,
        otpExpires: null,
        isVerified: true,
        isLinkedinVerified: faker.datatype.boolean({ probability: 0.85 }),
        isAdmin: false,
        isRecruiter: true,
        isInterviewer: false,
        isCandidate: false,
        isTopRated: faker.datatype.boolean({ probability: 0.25 }),
        stripeAccountId: null,
        stripeAccountStatus: null,
        payoutEnabled: false,
        stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
        deletedAt: null,
      };

      users.push(user);
    }

    // Generate 45 interviewers
    for (let i = 0; i < 45; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const contact = generateUniqueContact(
        firstName,
        lastName,
        usedEmails,
        usedPhones
      );

      if (!contact) continue;

      const createdAt = safeDateBetween(sixMonthsAgo, now);
      const accountStatus = faker.helpers.weightedArrayElement([
        { weight: 20, value: 'pending' },
        { weight: 65, value: 'verified' },
        { weight: 15, value: 'restricted' },
      ]);

      const user = {
        firstName,
        lastName,
        email: contact.email,
        phone: contact.phone,
        password: await hashPassword('Password@123'),
        otp: null,
        otpExpires: null,
        isVerified: true,
        isLinkedinVerified: faker.datatype.boolean({ probability: 0.9 }),
        isAdmin: false,
        isRecruiter: false,
        isInterviewer: true,
        isCandidate: false,
        isTopRated: faker.datatype.boolean({ probability: 0.35 }),
        stripeAccountId: `acct_${faker.string.alphanumeric(16)}`,
        stripeAccountStatus: accountStatus,
        payoutEnabled:
          accountStatus === 'verified'
            ? faker.datatype.boolean({ probability: 0.8 })
            : false,
        stripeCustomerId: null,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
        deletedAt: null,
      };

      users.push(user);
    }

    // Generate 120 candidates
    for (let i = 0; i < 120; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const contact = generateUniqueContact(
        firstName,
        lastName,
        usedEmails,
        usedPhones
      );

      if (!contact) continue;

      const createdAt = safeDateBetween(sixMonthsAgo, now);

      const user = {
        firstName,
        lastName,
        email: contact.email,
        phone: contact.phone,
        password: await hashPassword('Password@123'),
        otp: null,
        otpExpires: null,
        isVerified: faker.datatype.boolean({ probability: 0.88 }),
        isLinkedinVerified: faker.datatype.boolean({ probability: 0.75 }),
        isAdmin: false,
        isRecruiter: false,
        isInterviewer: false,
        isCandidate: true,
        isTopRated: faker.datatype.boolean({ probability: 0.18 }),
        stripeAccountId: null,
        stripeAccountStatus: null,
        payoutEnabled: false,
        stripeCustomerId: null,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
        deletedAt: null,
      };

      users.push(user);
    }

    if (users.length === 0) {
      throw new Error(
        'No unique users could be generated. Please check your existing data.'
      );
    }

    try {
      await queryInterface.bulkInsert('Users', users, {});
    } catch (error) {
      console.error('Error inserting users:', error);
      throw error;
    }

    // Get inserted user IDs with proper role identification
    const insertedUsers = await queryInterface.sequelize.query(
      `SELECT id, email, "isRecruiter", "isInterviewer", "isCandidate", "createdAt" 
       FROM "Users" 
       WHERE email NOT IN ('admin@optahire.com', 'recruiter@optahire.com', 'interviewer@optahire.com', 'interviewer2@optahire.com', 'candidate@optahire.com', 'candidate2@optahire.com')
       ORDER BY "createdAt" DESC 
       LIMIT ${users.length}`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const recruiterUsers = insertedUsers.filter((u) => u.isRecruiter);
    const interviewerUsers = insertedUsers.filter((u) => u.isInterviewer);
    const candidateUsers = insertedUsers.filter((u) => u.isCandidate);

    console.log(
      `Generated users: ${insertedUsers.length} (${recruiterUsers.length} recruiters, ${interviewerUsers.length} interviewers, ${candidateUsers.length} candidates)`
    );

    // Check for existing resumes to avoid conflicts
    let usersWithResumes = new Set();
    if (insertedUsers.length > 0) {
      try {
        const existingResumes = await queryInterface.sequelize.query(
          `SELECT "userId" FROM "Resumes" WHERE "userId" IN (${insertedUsers.map((u) => `'${u.id}'`).join(',')})`,
          { type: Sequelize.QueryTypes.SELECT }
        );
        usersWithResumes = new Set(existingResumes.map((r) => r.userId));
      } catch (error) {
        console.log(
          'No existing resumes found or error checking resumes:',
          error.message
        );
        usersWithResumes = new Set();
      }
    }

    // Create enhanced Resumes with better skill matching
    const resumes = [];
    const experienceLevels = [
      'Entry',
      'Junior',
      'Mid-level',
      'Senior',
      'Lead',
      'Principal',
      'Staff',
    ];

    // Generate resumes for candidates (excluding those who already have resumes)
    for (const candidate of candidateUsers) {
      if (usersWithResumes.has(candidate.id)) continue;

      const industry = faker.helpers.arrayElement(industries);
      const experienceLevel = faker.helpers.weightedArrayElement([
        { weight: 15, value: 'Entry' },
        { weight: 25, value: 'Junior' },
        { weight: 35, value: 'Mid-level' },
        { weight: 20, value: 'Senior' },
        { weight: 5, value: 'Lead' },
      ]);

      const createdAt = safeDateBetween(new Date(candidate.createdAt), now);

      const yearsExperience = {
        Entry: faker.number.int({ min: 0, max: 2 }),
        Junior: faker.number.int({ min: 1, max: 3 }),
        'Mid-level': faker.number.int({ min: 3, max: 6 }),
        Senior: faker.number.int({ min: 6, max: 12 }),
        Lead: faker.number.int({ min: 8, max: 15 }),
      }[experienceLevel];

      const skillCount = {
        Entry: { min: 3, max: 8 },
        Junior: { min: 5, max: 10 },
        'Mid-level': { min: 8, max: 15 },
        Senior: { min: 12, max: 20 },
        Lead: { min: 15, max: 25 },
      }[experienceLevel];

      const selectedSkills = faker.helpers.arrayElements(
        industry.skills,
        skillCount
      );

      resumes.push({
        title: `${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)}`,
        summary: `${experienceLevel} ${industry.name.toLowerCase()} professional with ${yearsExperience} years of hands-on experience. ${faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }))}`,
        headline: `${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)} | ${selectedSkills.slice(0, 3).join(' • ')}`,
        skills: selectedSkills,
        experience: `**Current Role**: ${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)} at ${faker.helpers.arrayElement(industry.companies)}\n\n**Experience Summary**: ${faker.lorem.paragraphs(faker.number.int({ min: 2, max: 4 }))}\n\n**Key Achievements**: ${faker.lorem.paragraph()}`,
        education: `${faker.helpers.arrayElement(['Bachelor of Science', 'Master of Science', 'Bachelor of Arts', 'Master of Arts'])} in ${faker.helpers.arrayElement(['Computer Science', 'Engineering', 'Information Technology', 'Data Science', 'Business', 'Mathematics'])}\n${faker.company.name()} University (${faker.date.past({ years: yearsExperience + 4 }).getFullYear()})`,
        industry: industry.name,
        availability: faker.helpers.arrayElement(availabilities),
        company: faker.helpers.arrayElement(industry.companies),
        achievements: `• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}`,
        rating: faker.number.float({ min: 3.2, max: 5.0, multipleOf: 0.1 }),
        portfolio: faker.datatype.boolean({ probability: 0.7 })
          ? faker.internet.url()
          : null,
        userId: candidate.id,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
        deletedAt: null,
      });
    }

    // Generate resumes for interviewers (excluding those who already have resumes)
    for (const interviewer of interviewerUsers) {
      if (usersWithResumes.has(interviewer.id)) continue;

      const industry = faker.helpers.arrayElement(industries);
      const experienceLevel = faker.helpers.weightedArrayElement([
        { weight: 10, value: 'Senior' },
        { weight: 30, value: 'Lead' },
        { weight: 35, value: 'Principal' },
        { weight: 25, value: 'Staff' },
      ]);

      const createdAt = safeDateBetween(new Date(interviewer.createdAt), now);

      const yearsExperience = {
        Senior: faker.number.int({ min: 6, max: 10 }),
        Lead: faker.number.int({ min: 8, max: 15 }),
        Principal: faker.number.int({ min: 12, max: 20 }),
        Staff: faker.number.int({ min: 10, max: 18 }),
      }[experienceLevel];

      const interviewingSkills = [
        'Technical Interviewing',
        'Talent Assessment',
        'Communication Skills',
        'Code Review',
        'System Design Interviews',
        'Behavioral Interviews',
        'Technical Mentoring',
        'Performance Evaluation',
      ];

      const industrySkills = faker.helpers.arrayElements(industry.skills, {
        min: 15,
        max: 25,
      });
      const allSkills = [
        ...industrySkills,
        ...faker.helpers.arrayElements(interviewingSkills, { min: 3, max: 6 }),
      ];

      resumes.push({
        title: `${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)} & Technical Interviewer`,
        summary: `Seasoned ${industry.name.toLowerCase()} professional with ${yearsExperience} years of industry experience and extensive background in technical interviewing. Conducted 200+ interviews across various technical domains. ${faker.lorem.sentences(2)}`,
        headline: `${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)} | Expert Technical Interviewer | ${industrySkills.slice(0, 4).join(' • ')}`,
        skills: allSkills,
        experience: `**Current Role**: ${experienceLevel} ${faker.helpers.arrayElement(industry.jobTitles)} at ${faker.helpers.arrayElement(industry.companies)}\n\n**Interviewing Experience**: \n• Conducted ${faker.number.int({ min: 100, max: 500 })}+ technical interviews\n• Expertise in ${faker.helpers.arrayElements(['coding', 'system design', 'behavioral', 'architectural'], { min: 2, max: 4 }).join(', ')} interviews\n• ${faker.number.int({ min: 85, max: 98 })}% candidate satisfaction rate\n\n**Professional Experience**: ${faker.lorem.paragraphs(3)}`,
        education: `${faker.helpers.arrayElement(['Master of Science', 'Bachelor of Science', 'PhD'])} in ${faker.helpers.arrayElement(['Computer Science', 'Engineering', 'Data Science', 'Applied Mathematics'])}\n${faker.company.name()} University (${faker.date.past({ years: yearsExperience + 6 }).getFullYear()})`,
        industry: industry.name,
        availability: faker.helpers.arrayElement(availabilities),
        company: faker.helpers.arrayElement(industry.companies),
        achievements: `• Conducted ${faker.number.int({ min: 200, max: 800 })}+ successful technical interviews\n• Maintained ${faker.number.int({ min: 85, max: 98 })}% accuracy in candidate assessments\n• Specialized in ${faker.helpers.arrayElements(industry.skills, { min: 3, max: 5 }).join(', ')}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}`,
        rating: faker.number.float({ min: 4.2, max: 5.0, multipleOf: 0.1 }),
        portfolio: faker.datatype.boolean({ probability: 0.85 })
          ? faker.internet.url()
          : null,
        userId: interviewer.id,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
        deletedAt: null,
      });
    }

    if (resumes.length > 0) {
      try {
        await queryInterface.bulkInsert('Resumes', resumes, {});
        console.log(`Generated resumes: ${resumes.length}`);
      } catch (error) {
        console.error('Error inserting resumes:', error);
        throw error;
      }
    }

    // Create realistic Jobs with seasonal patterns
    const jobs = [];
    for (let i = 0; i < 80; i++) {
      const recruiter = faker.helpers.arrayElement(recruiterUsers);
      if (!recruiter) continue;

      const industry = faker.helpers.arrayElement(industries);
      const jobTitle = faker.helpers.arrayElement(industry.jobTitles);
      const company = faker.helpers.arrayElement(industry.companies);
      const location = weightedRandomChoice(globalLocations);

      const baseDate = safeDateBetween(new Date(recruiter.createdAt), now);
      const seasonMultiplier = getHiringSeasonMultiplier(baseDate);
      const shouldCreate = Math.random() < seasonMultiplier;

      if (!shouldCreate && i < 60) continue;

      const experienceLevel = faker.helpers.weightedArrayElement([
        { weight: 20, value: 'Junior' },
        { weight: 40, value: 'Mid-level' },
        { weight: 30, value: 'Senior' },
        { weight: 10, value: 'Lead' },
      ]);

      const isRemote = location.city === 'Remote' || location.city === 'Hybrid';
      const requiredSkills = faker.helpers.arrayElements(industry.skills, {
        min: 5,
        max: 10,
      });
      const niceToHaveSkills = faker.helpers.arrayElements(industry.skills, {
        min: 2,
        max: 5,
      });

      // Create requirements with proper stringification
      const requirements = [
        `${faker.helpers.arrayElement(["Bachelor's", "Master's"])} degree in ${faker.helpers.arrayElement(['Computer Science', 'Information Technology', 'Engineering', industry.name, 'or related field'])}`,
        `${faker.number.int({ min: 2, max: 8 })}+ years of experience in ${industry.name.toLowerCase()}`,
        `Proficiency in ${requiredSkills.slice(0, 3).join(', ')}`,
        `Experience with ${requiredSkills.slice(3, 5).join(' and ')}`,
        `Strong ${faker.helpers.arrayElement(['communication', 'problem-solving', 'analytical', 'leadership', 'teamwork'])} skills`,
      ];

      // Create benefits with proper stringification
      const benefits = [
        `Comprehensive health insurance${faker.helpers.arrayElement([', dental and vision coverage', ' and wellness programs', ' package'])}`,
        `${faker.helpers.arrayElement(['401(k)', 'Retirement plan'])} with ${faker.helpers.arrayElement(['company matching', 'employer contributions'])}`,
        `${faker.helpers.arrayElement(['Flexible work arrangements', 'Remote work options', 'Hybrid work model'])}`,
        `${faker.helpers.arrayElement(['Professional development budget', 'Learning stipend', 'Training opportunities'])}`,
        `${faker.helpers.arrayElement(['Unlimited PTO', 'Generous vacation', 'Flexible time off'])} policy`,
        `${faker.helpers.arrayElement(['Stock options', 'Equity participation', 'Performance bonuses'])}`,
      ];

      jobs.push({
        title: `${experienceLevel} ${jobTitle} at ${company}`,
        description: `We are looking for a ${experienceLevel.toLowerCase()} ${jobTitle} to join our team at ${company}. The ideal candidate will have a strong background in ${industry.name.toLowerCase()} and a passion for innovation. You will be responsible for ${faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }))}`,
        requirements: JSON.stringify(requirements),
        salaryRange: generateSalaryRange(
          industry,
          location.city,
          experienceLevel
        ),
        category: faker.helpers.arrayElement([
          'IT',
          'Engineering',
          'Sales',
          'Marketing',
          'Finance',
          'Other',
        ]),
        location: location.city,
        company: company,
        benefits: JSON.stringify(benefits),
        isClosed: faker.datatype.boolean({ probability: 0.3 }),
        recruiterId: recruiter.id,
        createdAt: baseDate,
        updatedAt: safeDateBetween(baseDate, now),
      });
    }

    if (jobs.length > 0) {
      try {
        await queryInterface.bulkInsert('Jobs', jobs, {});
      } catch (error) {
        console.error('Error inserting jobs:', error);
        throw error;
      }
    }

    // Get job IDs
    const insertedJobs = await queryInterface.sequelize.query(
      `SELECT id, "recruiterId", "isClosed", "createdAt" FROM "Jobs" 
       WHERE "recruiterId" IN (${recruiterUsers.map((u) => `'${u.id}'`).join(',')})
       ORDER BY "createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Generated jobs: ${insertedJobs.length}`);

    // Create realistic Applications with proper timing and uniqueness
    const applications = [];
    const applicationTracker = new Set(); // Track job-candidate combinations

    for (
      let i = 0;
      i < Math.min(350, insertedJobs.length * candidateUsers.length);
      i++
    ) {
      const job = faker.helpers.arrayElement(insertedJobs);
      const candidate = faker.helpers.arrayElement(candidateUsers);

      if (!job || !candidate) continue;

      // Create unique key for job-candidate combination
      const applicationKey = `${job.id}-${candidate.id}`;
      if (applicationTracker.has(applicationKey)) continue;

      applicationTracker.add(applicationKey);

      // Set application date range based on job status
      let toDate;
      if (job.isClosed) {
        // For closed jobs, applications happened before closing (30 days after job creation)
        toDate = new Date(job.createdAt);
        toDate.setDate(toDate.getDate() + 30);
        // Ensure toDate doesn't exceed current time
        if (toDate > now) toDate = now;
      } else {
        toDate = now;
      }

      const applicationDate = safeDateBetween(new Date(job.createdAt), toDate);

      const status = faker.helpers.weightedArrayElement([
        { weight: 60, value: 'applied' },
        { weight: 25, value: 'shortlisted' },
        { weight: 12, value: 'rejected' },
        { weight: 3, value: 'hired' },
      ]);

      applications.push({
        status,
        applicationDate,
        jobId: job.id,
        candidateId: candidate.id,
        createdAt: applicationDate,
        updatedAt: safeDateBetween(applicationDate, now),
      });
    }

    if (applications.length > 0) {
      try {
        await queryInterface.bulkInsert('Applications', applications, {});
      } catch (error) {
        console.error('Error inserting applications:', error);
        throw error;
      }
    }

    // Get application IDs
    const insertedApplications = await queryInterface.sequelize.query(
      `SELECT id, "jobId", "candidateId", "status", "createdAt" FROM "Applications" 
       WHERE "jobId" IN (${insertedJobs.map((j) => `'${j.id}'`).join(',')})
       ORDER BY "createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Generated applications: ${insertedApplications.length}`);

    // Create ChatRooms with realistic interaction patterns and uniqueness
    const chatRooms = [];
    const chatRoomTracker = new Set(); // Track recruiter-interviewer-job combinations

    for (
      let i = 0;
      i < Math.min(55, insertedJobs.length * interviewerUsers.length);
      i++
    ) {
      const job = faker.helpers.arrayElement(insertedJobs);
      const interviewer = faker.helpers.arrayElement(interviewerUsers);

      if (!job || !interviewer) continue;

      // Create unique key for recruiter-interviewer-job combination
      const chatRoomKey = `${job.recruiterId}-${interviewer.id}-${job.id}`;
      if (chatRoomTracker.has(chatRoomKey)) continue;

      chatRoomTracker.add(chatRoomKey);

      const createdAt = safeDateBetween(new Date(job.createdAt), now);

      chatRooms.push({
        recruiterId: job.recruiterId,
        interviewerId: interviewer.id,
        jobId: job.id,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
      });
    }

    if (chatRooms.length > 0) {
      try {
        await queryInterface.bulkInsert('ChatRooms', chatRooms, {});
      } catch (error) {
        console.error('Error inserting chat rooms:', error);
        throw error;
      }
    }

    // Get chatroom IDs
    const insertedChatRooms = await queryInterface.sequelize.query(
      `SELECT id, "recruiterId", "interviewerId", "jobId", "createdAt" FROM "ChatRooms" 
       WHERE "recruiterId" IN (${recruiterUsers.map((u) => `'${u.id}'`).join(',')})
       ORDER BY "createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Generated chat rooms: ${insertedChatRooms.length}`);

    // Create realistic Messages with conversation flow
    const messages = [];
    const conversationTemplates = {
      opening: [
        'Hi! I noticed your expertise in {skills} and would love to discuss some interview opportunities.',
        'Hello! We have several {experienceLevel} positions that could benefit from your interviewing expertise.',
        'Hi there! Your background in {industry} interviews caught my attention. Are you available for some projects?',
        "Hello! We're looking for experienced interviewers for our {jobTitle} positions. Interested?",
      ],
      details: [
        'We typically need interviews completed within {timeframe}. Does that work for you?',
        'The role focuses on {skills}. Your rate would be ${rate}/hour for each interview.',
        'We have {count} candidates lined up. Each interview is about 45-60 minutes.',
        'The position requires strong {skills} assessment. Can you handle technical deep-dives?',
      ],
      negotiation: [
        'That rate works for us! When can you start?',
        "Perfect! I'll send over the candidate profiles and job description.",
        "Great! Let's set up a brief call to discuss the interview format.",
        "Excellent! I'll prepare the contract for ${amount} for {count} interviews.",
      ],
      scheduling: [
        'The candidates are available {days}. Which days work best for you?',
        'Can you handle back-to-back interviews or prefer spacing them out?',
        "We'll need these completed by {deadline}. Is that feasible?",
        "I'll send calendar invites once you confirm your availability.",
      ],
    };

    for (let i = 0; i < Math.min(420, insertedChatRooms.length * 8); i++) {
      const chatRoom = faker.helpers.arrayElement(insertedChatRooms);
      if (!chatRoom) continue;

      const messageStage = faker.helpers.arrayElement([
        'opening',
        'details',
        'negotiation',
        'scheduling',
      ]);
      const isFromRecruiter = faker.datatype.boolean({ probability: 0.55 });

      const createdAt = safeDateBetween(new Date(chatRoom.createdAt), now);

      let content = faker.helpers.arrayElement(
        conversationTemplates[messageStage]
      );

      // Replace template variables
      const industry = faker.helpers.arrayElement(industries);
      content = content
        .replace(
          '{skills}',
          faker.helpers
            .arrayElements(industry.skills, { min: 1, max: 3 })
            .join(', ')
        )
        .replace('{industry}', industry.name)
        .replace(
          '{experienceLevel}',
          faker.helpers.arrayElement(['Junior', 'Mid-level', 'Senior'])
        )
        .replace('{jobTitle}', faker.helpers.arrayElement(industry.jobTitles))
        .replace('{rate}', faker.number.int({ min: 50, max: 250 }))
        .replace(
          '{timeframe}',
          faker.helpers.arrayElement([
            '2-3 days',
            'this week',
            'next week',
            '5 business days',
          ])
        )
        .replace('{count}', faker.number.int({ min: 2, max: 8 }))
        .replace('{amount}', faker.number.int({ min: 300, max: 2000 }))
        .replace(
          '{days}',
          faker.helpers.arrayElement([
            'Monday-Wednesday',
            'Thursday-Friday',
            'early next week',
          ])
        )
        .replace(
          '{deadline}',
          faker.helpers.arrayElement([
            'Friday',
            'end of next week',
            'within 10 days',
          ])
        );

      messages.push({
        chatRoomId: chatRoom.id,
        recruiterId: chatRoom.recruiterId,
        interviewerId: chatRoom.interviewerId,
        senderId: isFromRecruiter
          ? chatRoom.recruiterId
          : chatRoom.interviewerId,
        content,
        isRead: faker.datatype.boolean({ probability: 0.8 }),
        createdAt,
        updatedAt: createdAt,
      });
    }

    if (messages.length > 0) {
      try {
        await queryInterface.bulkInsert('Messages', messages, {});
      } catch (error) {
        console.error('Error inserting messages:', error);
        throw error;
      }
    }

    console.log(`Generated messages: ${messages.length}`);

    // Create realistic Contracts with proper workflow
    const contracts = [];
    for (let i = 0; i < Math.min(45, insertedChatRooms.length); i++) {
      const chatRoom = faker.helpers.arrayElement(insertedChatRooms);
      if (!chatRoom) continue;

      const agreedPrice = faker.number.int({ min: 250, max: 2500 });
      const createdAt = safeDateBetween(new Date(chatRoom.createdAt), now);

      const status = faker.helpers.weightedArrayElement([
        { weight: 25, value: 'pending' },
        { weight: 35, value: 'active' },
        { weight: 30, value: 'completed' },
        { weight: 10, value: 'cancelled' },
      ]);

      const paymentStatus =
        status === 'pending'
          ? 'pending'
          : status === 'cancelled'
            ? faker.helpers.arrayElement(['failed', 'refunded'])
            : faker.helpers.weightedArrayElement([
                { weight: 75, value: 'paid' },
                { weight: 20, value: 'pending' },
                { weight: 5, value: 'failed' },
              ]);

      contracts.push({
        agreedPrice,
        status,
        paymentStatus,
        paymentIntentId:
          paymentStatus !== 'pending'
            ? `pi_${faker.string.alphanumeric(24)}`
            : null,
        stripeApplicationFee: (agreedPrice * 0.025).toFixed(2),
        stripeTransferId:
          status === 'completed' && paymentStatus === 'paid'
            ? `tr_${faker.string.alphanumeric(24)}`
            : null,
        recruiterId: chatRoom.recruiterId,
        interviewerId: chatRoom.interviewerId,
        jobId: chatRoom.jobId,
        roomId: chatRoom.id,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
      });
    }

    if (contracts.length > 0) {
      try {
        await queryInterface.bulkInsert('Contracts', contracts, {});
      } catch (error) {
        console.error('Error inserting contracts:', error);
        throw error;
      }
    }

    // Get contract IDs
    const insertedContracts = await queryInterface.sequelize.query(
      `SELECT id, "agreedPrice", "status", "paymentStatus", "interviewerId", "recruiterId", "jobId", "createdAt" FROM "Contracts" 
       WHERE "recruiterId" IN (${recruiterUsers.map((u) => `'${u.id}'`).join(',')})
       ORDER BY "createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Generated contracts: ${insertedContracts.length}`);

    // Create realistic Interviews with proper scheduling
    const interviews = [];
    for (let i = 0; i < Math.min(180, insertedApplications.length); i++) {
      const application = faker.helpers.arrayElement(
        insertedApplications.filter((app) => app.status !== 'rejected')
      );
      const interviewer = faker.helpers.arrayElement(interviewerUsers);

      if (!application || !interviewer) continue;

      // Schedule interviews after application date but before now
      const baseTime = safeDateBetween(new Date(application.createdAt), now);

      // Schedule interviews in business hours
      const scheduledTime = new Date(baseTime);
      scheduledTime.setHours(faker.number.int({ min: 9, max: 17 }));
      scheduledTime.setMinutes(faker.helpers.arrayElement([0, 15, 30, 45]));

      const status = faker.helpers.weightedArrayElement([
        { weight: 20, value: 'scheduled' },
        { weight: 5, value: 'ongoing' },
        { weight: 65, value: 'completed' },
        { weight: 10, value: 'cancelled' },
      ]);

      let callStarted = null;
      let callEnded = null;
      let rating = null;
      let summary = null;

      if (status === 'ongoing' || status === 'completed') {
        callStarted = safeDateBetween(
          scheduledTime,
          new Date(scheduledTime.getTime() + 60 * 60 * 1000), // 1 hour after scheduled
          1 // 1 hour minimum difference
        );

        if (status === 'completed') {
          callEnded = new Date(
            callStarted.getTime() +
              faker.number.int({ min: 30, max: 90 }) * 60 * 1000
          );
          rating = faker.number.float({ min: 2.5, max: 5.0, multipleOf: 0.5 });
          summary = `Comprehensive technical assessment covering ${faker.helpers.arrayElements(['problem-solving', 'coding skills', 'system design', 'communication', 'technical depth'], { min: 2, max: 4 }).join(', ')}. ${faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }))}`;
        }
      }

      interviews.push({
        roomId: `interview-${faker.string.alphanumeric({ length: 12 })}`,
        scheduledTime,
        callStartedAt: callStarted,
        callEndedAt: callEnded,
        interviewerId: interviewer.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        applicationId: application.id,
        status,
        remarks:
          status === 'completed'
            ? `Interview completed successfully. Candidate demonstrated ${faker.helpers.arrayElement(['excellent', 'strong', 'good', 'satisfactory'])} technical competency.`
            : status === 'cancelled'
              ? `Interview ${faker.helpers.arrayElement(['rescheduled due to', 'cancelled due to'])} ${faker.helpers.arrayElement(['scheduling conflict', 'technical issues', 'candidate unavailability'])}.`
              : `Interview ${status}.`,
        summary,
        rating,
        createdAt: baseTime,
        updatedAt: safeDateBetween(baseTime, now),
      });
    }

    if (interviews.length > 0) {
      try {
        await queryInterface.bulkInsert('Interviews', interviews, {});
      } catch (error) {
        console.error('Error inserting interviews:', error);
        throw error;
      }
    }

    console.log(`Generated interviews: ${interviews.length}`);

    // Create InterviewerRatings for completed contracts
    const interviewerRatings = [];
    const completedContracts = insertedContracts.filter(
      (c) => c.status === 'completed'
    );

    for (let i = 0; i < Math.min(35, completedContracts.length); i++) {
      const contract = completedContracts[i];
      if (!contract) continue;

      const createdAt = safeDateBetween(new Date(contract.createdAt), now);
      const rating = faker.number.float({
        min: 3.8,
        max: 5.0,
        multipleOf: 0.1,
      });

      const feedbackTemplates = [
        `Outstanding interviewer! Conducted ${faker.number.int({ min: 3, max: 8 })} interviews with exceptional professionalism. Detailed feedback provided for each candidate.`,
        `Highly skilled technical interviewer. Great at assessing both technical competency and cultural fit. Would definitely hire again.`,
        `Excellent communication and evaluation skills. Candidates felt comfortable and the process was smooth and efficient.`,
        `Very experienced with ${faker.helpers.arrayElement(['system design', 'coding', 'behavioral', 'technical architecture'])} interviews. Provided actionable insights for each candidate.`,
        `Professional, punctual, and thorough. Completed all interviews on schedule with comprehensive written feedback.`,
        `Expert-level technical assessment skills. Highly recommended for ${faker.helpers.arrayElement(['senior', 'lead', 'principal'])} role evaluations.`,
      ];

      interviewerRatings.push({
        rating,
        feedback: faker.helpers.arrayElement(feedbackTemplates),
        interviewerId: contract.interviewerId,
        recruiterId: contract.recruiterId,
        jobId: contract.jobId,
        contractId: contract.id,
        createdAt,
        updatedAt: safeDateBetween(createdAt, now),
      });
    }

    if (interviewerRatings.length > 0) {
      try {
        await queryInterface.bulkInsert(
          'InterviewerRatings',
          interviewerRatings,
          {}
        );
      } catch (error) {
        console.error('Error inserting interviewer ratings:', error);
        throw error;
      }
    }

    console.log(`Generated interviewer ratings: ${interviewerRatings.length}`);

    // Create comprehensive Transactions
    const transactions = [];

    for (let i = 0; i < Math.min(75, insertedContracts.length); i++) {
      const contract = faker.helpers.arrayElement(insertedContracts);
      if (!contract) continue;

      try {
        const amount = parseFloat(contract.agreedPrice);
        const platformFee = Math.round(amount * 0.025 * 100) / 100;
        const netAmount = Math.round((amount - platformFee) * 100) / 100;

        const transactionDate = safeDateBetween(
          new Date(contract.createdAt),
          now
        );

        const transactionType = faker.helpers.weightedArrayElement([
          { weight: 35, value: 'payment' },
          { weight: 30, value: 'payout' },
          { weight: 20, value: 'platform_fee' },
          { weight: 15, value: 'refund' },
        ]);

        const status =
          transactionType === 'refund'
            ? faker.helpers.arrayElement(['completed', 'failed'])
            : faker.helpers.weightedArrayElement([
                { weight: 75, value: 'completed' },
                { weight: 15, value: 'pending' },
                { weight: 7, value: 'failed' },
                { weight: 3, value: 'cancelled' },
              ]);

        const transactionAmount =
          transactionType === 'platform_fee'
            ? platformFee
            : transactionType === 'payout'
              ? netAmount
              : amount;

        // Generate Stripe IDs safely
        const stripePaymentIntentId =
          ['payment', 'refund'].includes(transactionType) &&
          status !== 'pending'
            ? `pi_${faker.string.alphanumeric(24)}`
            : null;

        const stripeTransferId =
          transactionType === 'payout' && status === 'completed'
            ? `tr_${faker.string.alphanumeric(24)}`
            : null;

        const stripePayoutId =
          transactionType === 'payout' && status === 'completed'
            ? `po_${faker.string.alphanumeric(24)}`
            : null;

        transactions.push({
          amount: transactionAmount.toFixed(2),
          status,
          transactionDate,
          transactionType,
          stripePaymentIntentId,
          stripeTransferId,
          stripePayoutId,
          platformFee:
            transactionType !== 'platform_fee' ? platformFee.toFixed(2) : null,
          netAmount: transactionType === 'payout' ? netAmount.toFixed(2) : null,
          contractId: contract.id,
          createdAt: transactionDate,
          updatedAt: safeDateBetween(transactionDate, now),
        });
      } catch (error) {
        console.error(`Error creating transaction ${i}:`, error);
        continue;
      }
    }

    if (transactions.length > 0) {
      try {
        await queryInterface.bulkInsert('Transactions', transactions, {});
        console.log(`Generated transactions: ${transactions.length}`);
      } catch (error) {
        console.error('Error inserting transactions:', error);
        throw error;
      }
    } else {
      console.log('No transactions to insert');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ENHANCED SYNTHETIC DATA GENERATION COMPLETED!');
    console.log('='.repeat(80));
    console.log(`📊 Generated Data Summary:`);
    console.log(
      `   👥 Users: ${users.length} (${recruiterUsers.length} recruiters, ${interviewerUsers.length} interviewers, ${candidateUsers.length} candidates)`
    );
    console.log(
      `   📝 Resumes: ${resumes.length} with realistic skill distributions`
    );
    console.log(`   💼 Jobs: ${jobs.length} with seasonal hiring patterns`);
    console.log(
      `   📋 Applications: ${applications.length} with proper status flow`
    );
    console.log(
      `   💬 Messages: ${messages.length} in ${insertedChatRooms.length} chat rooms`
    );
    console.log(
      `   📜 Contracts: ${contracts.length} with realistic payment cycles`
    );
    console.log(
      `   🎤 Interviews: ${interviews.length} with proper scheduling`
    );
    console.log(
      `   ⭐ Ratings: ${interviewerRatings.length} interviewer ratings`
    );
    console.log(
      `   💰 Transactions: ${transactions.length} with complete payment flow`
    );
    console.log('='.repeat(80));
    console.log(
      '🚀 Your AI recruitment platform is now ready with 6 months of realistic data!'
    );
    console.log('='.repeat(80));
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign key constraints
    const defaultEmails = [
      'admin@optahire.com',
      'recruiter@optahire.com',
      'interviewer@optahire.com',
      'interviewer2@optahire.com',
      'candidate@optahire.com',
      'candidate2@optahire.com',
    ];

    // Get IDs of the default users to exclude their related data
    const defaultUsers = await queryInterface.sequelize.query(
      `SELECT id, "isRecruiter", "isInterviewer", "isCandidate" FROM "Users" WHERE email IN ('${defaultEmails.join("','")}')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (defaultUsers.length === 0) {
      console.log('No default users found, deleting all synthetic data...');

      // Delete all data
      await queryInterface.bulkDelete('Transactions', {}, {});
      await queryInterface.bulkDelete('InterviewerRatings', {}, {});
      await queryInterface.bulkDelete('Interviews', {}, {});
      await queryInterface.bulkDelete('Messages', {}, {});
      await queryInterface.bulkDelete('Contracts', {}, {});
      await queryInterface.bulkDelete('ChatRooms', {}, {});
      await queryInterface.bulkDelete('Applications', {}, {});
      await queryInterface.bulkDelete('Jobs', {}, {});
      await queryInterface.bulkDelete('Resumes', {}, {});
      await queryInterface.bulkDelete('Users', {}, {});

      console.log('All synthetic data deleted.');
      return;
    }

    const defaultUserIds = defaultUsers.map((user) => user.id);
    const defaultRecruiterIds = defaultUsers
      .filter((u) => u.isRecruiter)
      .map((u) => u.id);
    const defaultInterviewerIds = defaultUsers
      .filter((u) => u.isInterviewer)
      .map((u) => u.id);
    const defaultCandidateIds = defaultUsers
      .filter((u) => u.isCandidate)
      .map((u) => u.id);

    // Helper function to safely get contract IDs
    const getDefaultContractIds = async () => {
      if (
        defaultRecruiterIds.length === 0 &&
        defaultInterviewerIds.length === 0
      ) {
        return [];
      }

      let query = 'SELECT id FROM "Contracts" WHERE ';
      const conditions = [];

      if (defaultRecruiterIds.length > 0) {
        conditions.push(
          `"recruiterId" IN ('${defaultRecruiterIds.join("','")}')`
        );
      }
      if (defaultInterviewerIds.length > 0) {
        conditions.push(
          `"interviewerId" IN ('${defaultInterviewerIds.join("','")}')`
        );
      }

      query += conditions.join(' OR ');

      const results = await queryInterface.sequelize.query(query, {
        type: Sequelize.QueryTypes.SELECT,
      });
      return results.map((r) => r.id);
    };

    const defaultContractIds = await getDefaultContractIds();

    // Delete transactions while preserving those related to default users' contracts
    if (defaultContractIds.length > 0) {
      await queryInterface.bulkDelete(
        'Transactions',
        {
          contractId: { [Sequelize.Op.notIn]: defaultContractIds },
        },
        {}
      );
    } else {
      await queryInterface.bulkDelete('Transactions', {}, {});
    }

    // Delete ratings while preserving those related to default users
    if (defaultRecruiterIds.length > 0 || defaultInterviewerIds.length > 0) {
      const conditions = { [Sequelize.Op.and]: [] };

      if (defaultRecruiterIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          recruiterId: { [Sequelize.Op.notIn]: defaultRecruiterIds },
        });
      }
      if (defaultInterviewerIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          interviewerId: { [Sequelize.Op.notIn]: defaultInterviewerIds },
        });
      }

      await queryInterface.bulkDelete('InterviewerRatings', conditions, {});
    } else {
      await queryInterface.bulkDelete('InterviewerRatings', {}, {});
    }

    // Delete interviews while preserving those related to default users
    if (defaultInterviewerIds.length > 0 || defaultCandidateIds.length > 0) {
      const conditions = { [Sequelize.Op.and]: [] };

      if (defaultInterviewerIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          interviewerId: { [Sequelize.Op.notIn]: defaultInterviewerIds },
        });
      }
      if (defaultCandidateIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          candidateId: { [Sequelize.Op.notIn]: defaultCandidateIds },
        });
      }

      await queryInterface.bulkDelete('Interviews', conditions, {});
    } else {
      await queryInterface.bulkDelete('Interviews', {}, {});
    }

    // Delete messages while preserving those related to default users
    if (defaultRecruiterIds.length > 0 || defaultInterviewerIds.length > 0) {
      const conditions = { [Sequelize.Op.and]: [] };

      if (defaultRecruiterIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          recruiterId: { [Sequelize.Op.notIn]: defaultRecruiterIds },
        });
      }
      if (defaultInterviewerIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          interviewerId: { [Sequelize.Op.notIn]: defaultInterviewerIds },
        });
      }

      await queryInterface.bulkDelete('Messages', conditions, {});
    } else {
      await queryInterface.bulkDelete('Messages', {}, {});
    }

    // Delete contracts while preserving those related to default users
    if (defaultRecruiterIds.length > 0 || defaultInterviewerIds.length > 0) {
      const conditions = { [Sequelize.Op.and]: [] };

      if (defaultRecruiterIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          recruiterId: { [Sequelize.Op.notIn]: defaultRecruiterIds },
        });
      }
      if (defaultInterviewerIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          interviewerId: { [Sequelize.Op.notIn]: defaultInterviewerIds },
        });
      }

      await queryInterface.bulkDelete('Contracts', conditions, {});
    } else {
      await queryInterface.bulkDelete('Contracts', {}, {});
    }

    // Delete chat rooms while preserving those related to default users
    if (defaultRecruiterIds.length > 0 || defaultInterviewerIds.length > 0) {
      const conditions = { [Sequelize.Op.and]: [] };

      if (defaultRecruiterIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          recruiterId: { [Sequelize.Op.notIn]: defaultRecruiterIds },
        });
      }
      if (defaultInterviewerIds.length > 0) {
        conditions[Sequelize.Op.and].push({
          interviewerId: { [Sequelize.Op.notIn]: defaultInterviewerIds },
        });
      }

      await queryInterface.bulkDelete('ChatRooms', conditions, {});
    } else {
      await queryInterface.bulkDelete('ChatRooms', {}, {});
    }

    // Delete applications while preserving those related to default users
    if (defaultCandidateIds.length > 0) {
      await queryInterface.bulkDelete(
        'Applications',
        {
          candidateId: { [Sequelize.Op.notIn]: defaultCandidateIds },
        },
        {}
      );
    } else {
      await queryInterface.bulkDelete('Applications', {}, {});
    }

    // Delete jobs while preserving those related to default recruiters
    if (defaultRecruiterIds.length > 0) {
      await queryInterface.bulkDelete(
        'Jobs',
        {
          recruiterId: { [Sequelize.Op.notIn]: defaultRecruiterIds },
        },
        {}
      );
    } else {
      await queryInterface.bulkDelete('Jobs', {}, {});
    }

    // Delete resumes while preserving those related to default users
    if (defaultUserIds.length > 0) {
      await queryInterface.bulkDelete(
        'Resumes',
        {
          userId: { [Sequelize.Op.notIn]: defaultUserIds },
        },
        {}
      );
    } else {
      await queryInterface.bulkDelete('Resumes', {}, {});
    }

    // Delete users while preserving the default users
    await queryInterface.bulkDelete(
      'Users',
      {
        email: { [Sequelize.Op.notIn]: defaultEmails },
      },
      {}
    );

    console.log('\n' + '='.repeat(80));
    console.log('🗑️  ENHANCED SYNTHETIC DATA REMOVAL COMPLETED!');
    console.log('='.repeat(80));
    console.log(
      '🚀 Your AI recruitment platform is now back to its initial state!'
    );
    console.log('='.repeat(80));
  },
};
