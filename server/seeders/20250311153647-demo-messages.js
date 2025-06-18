'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // User IDs
    const recruiterId = '00000000-0000-0000-0000-000000000002'; // Moiz Nadeem
    const interviewerId1 = '00000000-0000-0000-0000-000000000003'; // Hassaan Munir
    const interviewerId2 = '00000000-0000-0000-0000-000000000004'; // Hasnain Raza

    // ChatRoom IDs
    const chatRooms = [
      '40000000-0000-0000-0000-000000000001', // Senior Full Stack Developer (Hassaan)
      '40000000-0000-0000-0000-000000000002', // DevOps Engineer (Hassaan)
      '40000000-0000-0000-0000-000000000003', // Senior UX/UI Designer (Hassaan)
      '40000000-0000-0000-0000-000000000004', // Data Science Manager (Hasnain)
      '40000000-0000-0000-0000-000000000005', // Product Manager (Hasnain)
      '40000000-0000-0000-0000-000000000006', // Senior Full Stack Developer backup (Hasnain)
      '40000000-0000-0000-0000-000000000007', // Digital Marketing Specialist (Hassaan)
      '40000000-0000-0000-0000-000000000008', // Financial Analyst (Hasnain)
      '40000000-0000-0000-0000-000000000009', // Sales Development Representative (Hassaan)
    ];

    const messages = [];

    // Chat Room 1: Senior Full Stack Developer (Hassaan) - Active conversation
    const baseTime1 = now.getTime() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000001',
        chatRoomId: chatRooms[0],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          "Hi Hassaan! I hope you're doing well. I came across your profile and I'm really impressed with your technical interviewing experience. I have a Senior Full Stack Developer position that would be perfect for your expertise. Are you available for conducting interviews this week?",
        isRead: true,
        createdAt: new Date(baseTime1),
        updatedAt: new Date(baseTime1),
      },
      {
        id: '50000000-0000-0000-0000-000000000002',
        chatRoomId: chatRooms[0],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: interviewerId1,
        content:
          "Hello Moiz! Thank you for reaching out. Yes, I'm definitely interested in learning more about this opportunity. I have extensive experience interviewing full-stack developers. Could you share more details about the role requirements and the type of candidates you're looking for?",
        isRead: true,
        createdAt: new Date(baseTime1 + 30 * 60 * 1000), // 30 minutes later
        updatedAt: new Date(baseTime1 + 30 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000003',
        chatRoomId: chatRooms[0],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          "Perfect! We're looking for someone with 5+ years of experience in React, Node.js, and full-stack development. The interviews would be 60-minute technical sessions focusing on coding, system design, and problem-solving. The compensation is $150 per interview. What's your availability like?",
        isRead: true,
        createdAt: new Date(baseTime1 + 2 * 60 * 60 * 1000), // 2 hours later
        updatedAt: new Date(baseTime1 + 2 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000004',
        chatRoomId: chatRooms[0],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: interviewerId1,
        content:
          "That sounds excellent! I'm very comfortable with those technologies and have conducted similar interviews before. I'm available Tuesday through Thursday this week, preferably between 2-6 PM. Should we discuss the contract details and next steps?",
        isRead: true,
        createdAt: new Date(baseTime1 + 4 * 60 * 60 * 1000), // 4 hours later
        updatedAt: new Date(baseTime1 + 4 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000005',
        chatRoomId: chatRooms[0],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          "Excellent! Your background is perfect for this role. I'll send you a contract with all the details including the $150 per interview rate. We have 3 candidates lined up for this week. Once you review and sign the contract, we can schedule the interviews. Looking forward to working with you!",
        isRead: false,
        createdAt: new Date(baseTime1 + 1 * 24 * 60 * 60 * 1000), // 1 day later
        updatedAt: new Date(baseTime1 + 1 * 24 * 60 * 60 * 1000),
      }
    );

    // Chat Room 2: DevOps Engineer (Hassaan) - Recent conversation
    const baseTime2 = now.getTime() - 8 * 24 * 60 * 60 * 1000; // 8 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000006',
        chatRoomId: chatRooms[1],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          'Hi Hassaan! I have another opportunity for you - a DevOps Engineer position. Since you have experience with backend technologies, would you be comfortable interviewing DevOps candidates as well?',
        isRead: true,
        createdAt: new Date(baseTime2),
        updatedAt: new Date(baseTime2),
      },
      {
        id: '50000000-0000-0000-0000-000000000007',
        chatRoomId: chatRooms[1],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: interviewerId1,
        content:
          "Absolutely! I have good knowledge of Docker, Kubernetes, and cloud platforms. I've interviewed several DevOps candidates before. What specific areas should I focus on for this role?",
        isRead: true,
        createdAt: new Date(baseTime2 + 45 * 60 * 1000), // 45 minutes later
        updatedAt: new Date(baseTime2 + 45 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000008',
        chatRoomId: chatRooms[1],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          'Great! Focus on AWS services, containerization, CI/CD pipelines, and infrastructure as code. We have one strong candidate who looks promising. Same rate as before - $150 per interview. Are you available tomorrow afternoon?',
        isRead: false,
        createdAt: new Date(baseTime2 + 1 * 24 * 60 * 60 * 1000), // 1 day later
        updatedAt: new Date(baseTime2 + 1 * 24 * 60 * 60 * 1000),
      }
    );

    // Chat Room 4: Data Science Manager (Hasnain) - Established conversation
    const baseTime4 = now.getTime() - 12 * 24 * 60 * 60 * 1000; // 12 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000009',
        chatRoomId: chatRooms[3],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: recruiterId,
        content:
          'Hello Hasnain! I have a senior-level position that would be perfect for your system design expertise - a Data Science Manager role. This requires evaluating both technical skills and leadership capabilities. Interested?',
        isRead: true,
        createdAt: new Date(baseTime4),
        updatedAt: new Date(baseTime4),
      },
      {
        id: '50000000-0000-0000-0000-000000000010',
        chatRoomId: chatRooms[3],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: interviewerId2,
        content:
          'Hi Moiz! That sounds very interesting. I have experience interviewing for senior technical leadership roles. What specific areas should I focus on - technical depth, team management, or strategic thinking?',
        isRead: true,
        createdAt: new Date(baseTime4 + 1 * 60 * 60 * 1000), // 1 hour later
        updatedAt: new Date(baseTime4 + 1 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000011',
        chatRoomId: chatRooms[3],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: recruiterId,
        content:
          'All three actually! We need someone who can evaluate their machine learning knowledge, system design skills for data platforms, and their ability to lead a team of data scientists. This is a $200 per interview role given the seniority. Can you handle a 90-minute comprehensive assessment?',
        isRead: true,
        createdAt: new Date(baseTime4 + 6 * 60 * 60 * 1000), // 6 hours later
        updatedAt: new Date(baseTime4 + 6 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000012',
        chatRoomId: chatRooms[3],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: interviewerId2,
        content:
          "Perfect! I'm very comfortable with comprehensive senior-level assessments. 90 minutes will allow for proper evaluation of technical depth, architectural thinking, and leadership scenarios. When do you need this completed?",
        isRead: true,
        createdAt: new Date(baseTime4 + 1 * 24 * 60 * 60 * 1000), // 1 day later
        updatedAt: new Date(baseTime4 + 1 * 24 * 60 * 60 * 1000),
      }
    );

    // Chat Room 5: Product Manager (Hasnain) - Recent discussion
    const baseTime5 = now.getTime() - 9 * 24 * 60 * 60 * 1000; // 9 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000013',
        chatRoomId: chatRooms[4],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: recruiterId,
        content:
          'Hi Hasnain! I have a Product Manager position that requires someone who can evaluate both technical understanding and strategic thinking. Given your system design background, would you be interested?',
        isRead: true,
        createdAt: new Date(baseTime5),
        updatedAt: new Date(baseTime5),
      },
      {
        id: '50000000-0000-0000-0000-000000000014',
        chatRoomId: chatRooms[4],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: interviewerId2,
        content:
          "Definitely interested! I often evaluate candidates on their technical acumen and strategic thinking. For a PM role, I'd focus on product sense, technical trade-offs, and stakeholder management. What's the experience level you're targeting?",
        isRead: true,
        createdAt: new Date(baseTime5 + 2 * 60 * 60 * 1000), // 2 hours later
        updatedAt: new Date(baseTime5 + 2 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000015',
        chatRoomId: chatRooms[4],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: recruiterId,
        content:
          "We're looking for someone with 4+ years of PM experience in B2B SaaS. The interview should cover product strategy, technical feasibility discussions, and user research insights. Standard $175 rate for this 75-minute session. Does that work for you?",
        isRead: false,
        createdAt: new Date(baseTime5 + 2 * 24 * 60 * 60 * 1000), // 2 days later
        updatedAt: new Date(baseTime5 + 2 * 24 * 60 * 60 * 1000),
      }
    );

    // Chat Room 7: Digital Marketing Specialist (Hassaan) - Quick conversation
    const baseTime7 = now.getTime() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000016',
        chatRoomId: chatRooms[6],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          "Hey Hassaan! I have a non-technical role - Digital Marketing Specialist. I know it's outside your usual technical interviews, but would you be open to conducting a general competency and communication skills assessment?",
        isRead: true,
        createdAt: new Date(baseTime7),
        updatedAt: new Date(baseTime7),
      },
      {
        id: '50000000-0000-0000-0000-000000000017',
        chatRoomId: chatRooms[6],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: interviewerId1,
        content:
          'Sure! I can definitely handle behavioral interviews and assess communication skills, creativity, and analytical thinking. What specific areas should I focus on for the marketing role?',
        isRead: true,
        createdAt: new Date(baseTime7 + 1 * 60 * 60 * 1000), // 1 hour later
        updatedAt: new Date(baseTime7 + 1 * 60 * 60 * 1000),
      },
      {
        id: '50000000-0000-0000-0000-000000000018',
        chatRoomId: chatRooms[6],
        recruiterId: recruiterId,
        interviewerId: interviewerId1,
        senderId: recruiterId,
        content:
          "Focus on their analytical approach to campaigns, creativity in problem-solving, and communication style. It's a $120 rate for 45 minutes since it's more of a soft skills assessment. Let me know if you're available this Friday!",
        isRead: false,
        createdAt: new Date(baseTime7 + 1 * 24 * 60 * 60 * 1000), // 1 day later
        updatedAt: new Date(baseTime7 + 1 * 24 * 60 * 60 * 1000),
      }
    );

    // Chat Room 8: Financial Analyst (Hasnain) - Initial contact
    const baseTime8 = now.getTime() - 4 * 24 * 60 * 60 * 1000; // 4 days ago
    messages.push(
      {
        id: '50000000-0000-0000-0000-000000000019',
        chatRoomId: chatRooms[7],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: recruiterId,
        content:
          "Hi Hasnain! I have a Financial Analyst position that requires strong analytical and logical thinking skills. While it's not technical, your system design background shows you have excellent analytical capabilities. Would you be interested in conducting this interview?",
        isRead: true,
        createdAt: new Date(baseTime8),
        updatedAt: new Date(baseTime8),
      },
      {
        id: '50000000-0000-0000-0000-000000000020',
        chatRoomId: chatRooms[7],
        recruiterId: recruiterId,
        interviewerId: interviewerId2,
        senderId: interviewerId2,
        content:
          "I'm open to it! My analytical and problem-solving skills from system design interviews should transfer well. I can assess their logical reasoning, attention to detail, and problem-solving approach. What should be the main focus areas?",
        isRead: false,
        createdAt: new Date(baseTime8 + 4 * 60 * 60 * 1000), // 4 hours later
        updatedAt: new Date(baseTime8 + 4 * 60 * 60 * 1000),
      }
    );

    await queryInterface.bulkInsert('Messages', messages, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};
