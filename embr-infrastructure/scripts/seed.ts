import { PrismaClient, UserRole, PostType, PostVisibility, GigCategory, GigStatus, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate random number
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to pick random items from array
const pickRandom = <T>(arr: T[], count: number = 1): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Sample data
const usernames = [
  'creator_alex', 'video_sarah', 'designer_mike', 'writer_emma', 'musician_jake',
  'photographer_lisa', 'animator_david', 'editor_rachel', 'artist_kevin', 'developer_nina',
  'marketer_tom', 'chef_maria', 'fitness_john', 'travel_sophie', 'fashion_olivia',
  'tech_guru', 'nature_lover', 'bookworm', 'movie_buff', 'game_master',
  'yoga_teacher', 'food_blogger', 'diy_expert', 'pet_parent', 'adventure_seeker'
];

const firstNames = ['Alex', 'Sarah', 'Mike', 'Emma', 'Jake', 'Lisa', 'David', 'Rachel', 'Kevin', 'Nina', 'Tom', 'Maria', 'John', 'Sophie', 'Olivia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const skills = ['Video Editing', 'Graphic Design', 'Content Writing', 'Social Media', 'Photography', 'Animation', 'Music Production', 'Voice Acting', '3D Modeling', 'UI/UX Design'];
const categories = ['Technology', 'Entertainment', 'Education', 'Lifestyle', 'Business', 'Art', 'Music', 'Gaming', 'Fitness', 'Travel'];

const postContents = [
  'Just launched my new project! 🚀',
  'Behind the scenes of my creative process',
  'Tips and tricks you need to know',
  'This changed everything for me',
  'Quick tutorial on my workflow',
  'Day in the life of a creator',
  'My favorite tools and resources',
  'Here\'s what I learned today',
  'Excited to share this with you all!',
  'New content dropping soon 👀'
];

const gigTitles = [
  'Professional Video Editing',
  'Custom Logo Design',
  'SEO Blog Post Writing',
  'Social Media Management',
  'Product Photography',
  '2D Character Animation',
  'Original Music Composition',
  'Professional Voice Over',
  '3D Product Modeling',
  'UI/UX Design Services'
];

const gigDescriptions = [
  'I will deliver professional quality work with unlimited revisions until you\'re satisfied.',
  'High-quality deliverables with fast turnaround time and excellent communication.',
  'Experienced creator with 5+ years in the industry. Portfolio available upon request.',
  'Let\'s bring your vision to life! I specialize in creating content that converts.',
  'Professional service with attention to detail. 100% satisfaction guaranteed.'
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.review.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users with profiles
  console.log('👥 Creating users and profiles...');
  const users = [];
  const hashedPassword = await bcrypt.hash('test1234', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@embr.app',
      passwordHash: hashedPassword,
      role: UserRole.admin,
      isVerified: true,
      profile: {
        create: {
          username: 'admin',
          displayName: 'Embr Admin',
          bio: 'Official Embr platform administrator',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          location: 'San Francisco, CA',
        }
      },
      wallet: {
        create: {
          balance: 0,
        }
      }
    },
    include: { profile: true, wallet: true }
  });
  users.push(admin);

  // Create test creator
  const creator = await prisma.user.create({
    data: {
      email: 'creator@embr.app',
      passwordHash: hashedPassword,
      role: UserRole.creator,
      isVerified: true,
      profile: {
        create: {
          username: 'test_creator',
          displayName: 'Test Creator',
          bio: 'Professional content creator | Available for collaborations',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
          location: 'Los Angeles, CA',
          website: 'https://testcreator.com',
          skills: ['Video Editing', 'Photography', 'Content Creation'],
          categories: ['Entertainment', 'Lifestyle'],
        }
      },
      wallet: {
        create: {
          balance: 50000, // $500
          totalEarned: 100000, // $1000
        }
      }
    },
    include: { profile: true, wallet: true }
  });
  users.push(creator);

  // Create regular test user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@embr.app',
      passwordHash: hashedPassword,
      role: UserRole.user,
      isVerified: true,
      profile: {
        create: {
          username: 'test_user',
          displayName: 'Test User',
          bio: 'Just enjoying great content!',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          location: 'New York, NY',
        }
      },
      wallet: {
        create: {
          balance: 10000, // $100
        }
      }
    },
    include: { profile: true, wallet: true }
  });
  users.push(regularUser);

  // Create additional random users
  for (let i = 0; i < 47; i++) {
    const firstName = pickRandom(firstNames)[0];
    const lastName = pickRandom(lastNames)[0];
    const username = usernames[i % usernames.length] + random(100, 999);
    const role = i < 25 ? UserRole.creator : UserRole.user;

    const user = await prisma.user.create({
      data: {
        email: `${username}@example.com`,
        passwordHash: hashedPassword,
        role: role,
        isVerified: random(0, 10) > 2,
        profile: {
          create: {
            username: username,
            displayName: `${firstName} ${lastName}`,
            bio: `${role === UserRole.creator ? 'Creator' : 'Enthusiast'} | ${pickRandom(categories, 2).join(' & ')}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            location: pickRandom(['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Remote'])[0],
            website: role === UserRole.creator ? `https://${username}.com` : null,
            skills: role === UserRole.creator ? pickRandom(skills, random(2, 4)) : [],
            categories: pickRandom(categories, random(1, 3)),
          }
        },
        wallet: {
          create: {
            balance: random(0, 50000),
            totalEarned: random(0, 200000),
          }
        }
      },
      include: { profile: true, wallet: true }
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users\n`);

  // Create social connections (follows)
  console.log('🔗 Creating social connections...');
  let followCount = 0;
  for (const user of users) {
    const followTargets = pickRandom(users.filter(u => u.id !== user.id), random(3, 10));
    for (const target of followTargets) {
      try {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: target.id,
          }
        });
        
        // Update follower/following counts
        await prisma.profile.update({
          where: { userId: user.id },
          data: { followingCount: { increment: 1 } }
        });
        await prisma.profile.update({
          where: { userId: target.id },
          data: { followerCount: { increment: 1 } }
        });
        
        followCount++;
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  console.log(`✅ Created ${followCount} follow relationships\n`);

  // Create posts
  console.log('📝 Creating posts...');
  const posts = [];
  const creatorUsers = users.filter(u => u.role === UserRole.creator || u.role === UserRole.admin);
  
  for (let i = 0; i < 200; i++) {
    const author = pickRandom(creatorUsers)[0];
    const postType = pickRandom([PostType.text, PostType.video, PostType.image])[0];
    const hashtags = pickRandom(['fyp', 'viral', 'trending', 'creator', 'content', 'inspiration', 'tutorial', 'behindthescenes'], random(2, 4));
    
    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        type: postType,
        content: pickRandom(postContents)[0],
        mediaUrl: postType !== PostType.text ? `https://placehold.co/1080x1920/coral/white?text=Video+${i+1}` : null,
        thumbnailUrl: postType === PostType.video ? `https://placehold.co/1080x1920/coral/white?text=Thumb+${i+1}` : null,
        visibility: random(0, 10) > 1 ? PostVisibility.public : PostVisibility.followers,
        hashtags: hashtags,
        mentions: pickRandom(users, random(0, 2)).map(u => u.id),
        viewCount: random(100, 10000),
        likeCount: 0,
        commentCount: 0,
        shareCount: random(0, 100),
        duration: postType === PostType.video ? random(15, 180) : null,
        createdAt: new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000),
      }
    });
    posts.push(post);
  }
  console.log(`✅ Created ${posts.length} posts\n`);

  // Create likes
  console.log('❤️  Creating likes...');
  let likeCount = 0;
  for (const post of posts) {
    const likers = pickRandom(users, random(5, 50));
    for (const liker of likers) {
      try {
        await prisma.like.create({
          data: {
            userId: liker.id,
            postId: post.id,
          }
        });
        likeCount++;
      } catch (error) {
        // Skip duplicates
      }
    }
    
    // Update like count
    await prisma.post.update({
      where: { id: post.id },
      data: { likeCount: likeCount }
    });
  }
  console.log(`✅ Created ${likeCount} likes\n`);

  // Create comments
  console.log('💬 Creating comments...');
  let commentCount = 0;
  for (const post of posts) {
    const numComments = random(2, 15);
    for (let i = 0; i < numComments; i++) {
      const commenter = pickRandom(users)[0];
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: commenter.id,
          content: pickRandom(['Great content!', 'Love this!', 'Amazing work', 'Very helpful', 'Thanks for sharing'])[0],
          likeCount: random(0, 20),
        }
      });
      commentCount++;
    }
    
    // Update comment count
    await prisma.post.update({
      where: { id: post.id },
      data: { commentCount: numComments }
    });
  }
  console.log(`✅ Created ${commentCount} comments\n`);

  // Update post counts in profiles
  for (const user of creatorUsers) {
    const postCount = await prisma.post.count({ where: { authorId: user.id } });
    await prisma.profile.update({
      where: { userId: user.id },
      data: { postCount }
    });
  }

  // Create gigs
  console.log('💼 Creating gigs...');
  const gigs = [];
  for (let i = 0; i < 30; i++) {
    const creator = pickRandom(creatorUsers)[0];
    const category = pickRandom(Object.values(GigCategory))[0];
    
    const gig = await prisma.gig.create({
      data: {
        creatorId: creator.id,
        title: pickRandom(gigTitles)[0],
        description: pickRandom(gigDescriptions)[0],
        category: category,
        startingPrice: random(2500, 50000), // $25 - $500
        deliveryDays: pickRandom([1, 3, 5, 7, 14])[0],
        portfolioUrls: [`https://placehold.co/600x400?text=Portfolio+${i+1}`],
        skills: pickRandom(skills, random(2, 4)),
        status: pickRandom([GigStatus.active, GigStatus.draft])[0],
        viewCount: random(10, 1000),
        orderCount: random(0, 50),
        rating: random(40, 50) / 10,
        reviewCount: random(0, 30),
      }
    });
    gigs.push(gig);
  }
  console.log(`✅ Created ${gigs.length} gigs\n`);

  // Create gig bookings
  console.log('📋 Creating bookings...');
  for (let i = 0; i < 15; i++) {
    const gig = pickRandom(gigs.filter(g => g.status === GigStatus.active))[0];
    const buyer = pickRandom(users.filter(u => u.id !== gig.creatorId))[0];
    const creator = users.find(u => u.id === gig.creatorId);
    
    if (!creator) continue;

    const booking = await prisma.booking.create({
      data: {
        gigId: gig.id,
        buyerId: buyer.id,
        creatorId: creator.id,
        scope: 'Custom project requirements and deliverables',
        agreedPrice: gig.startingPrice + random(0, 10000),
        platformFee: Math.floor(gig.startingPrice * 0.1),
        status: pickRandom(['pending', 'accepted', 'in_progress', 'completed'])[0],
      }
    });

    // Create escrow for pending/in-progress bookings
    if (booking.status === 'pending' || booking.status === 'in_progress') {
      await prisma.escrow.create({
        data: {
          bookingId: booking.id,
          amount: booking.agreedPrice,
          status: 'held',
          stripePaymentIntentId: `pi_test_${random(100000, 999999)}`,
        }
      });
    }

    // Create review for completed bookings
    if (booking.status === 'completed') {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: buyer.id,
          revieweeId: creator.id,
          rating: random(4, 5),
          comment: 'Great work! Very professional and delivered on time.',
        }
      });
    }
  }
  console.log(`✅ Created bookings and escrows\n`);

  // Create jobs (simulating Relevnt API data)
  console.log('💼 Creating jobs...');
  const jobCompanies = ['TechCorp', 'Creative Agency', 'StartupXYZ', 'Media Group', 'Design Studio'];
  const jobTitles = [
    'Senior Frontend Developer',
    'Content Creator',
    'Video Editor',
    'Social Media Manager',
    'Graphic Designer',
    'Marketing Specialist',
    'Product Manager',
    'UX Designer'
  ];

  for (let i = 0; i < 20; i++) {
    await prisma.job.create({
      data: {
        relevntId: `RELEVNT-${random(10000, 99999)}`,
        title: pickRandom(jobTitles)[0],
        company: pickRandom(jobCompanies)[0],
        location: pickRandom(['New York, NY', 'San Francisco, CA', 'Remote', 'Los Angeles, CA'])[0],
        salaryMin: random(60000, 100000),
        salaryMax: random(100000, 150000),
        remote: random(0, 10) > 5,
        description: 'We are looking for a talented professional to join our team. This is an exciting opportunity to work on cutting-edge projects.',
        requirements: ['3+ years experience', 'Strong portfolio', 'Excellent communication skills'],
        benefits: ['Health insurance', '401k', 'Remote work options', 'Flexible hours'],
        applyUrl: `https://relevnt.com/jobs/apply/${random(10000, 99999)}`,
        tags: pickRandom(['javascript', 'react', 'design', 'video', 'marketing', 'remote'], random(2, 4)),
        postedAt: new Date(Date.now() - random(1, 30) * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + random(30, 90) * 24 * 60 * 60 * 1000),
        status: JobStatus.active,
      }
    });
  }
  console.log(`✅ Created 20 jobs\n`);

  // Create tips
  console.log('💰 Creating tips...');
  for (let i = 0; i < 50; i++) {
    const sender = pickRandom(users)[0];
    const post = pickRandom(posts)[0];
    const receiver = users.find(u => u.id === post.authorId);
    
    if (!receiver || sender.id === receiver.id) continue;

    const tipAmount = pickRandom([500, 1000, 2000, 5000])[0]; // $5-$50

    await prisma.tip.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        postId: post.id,
        amount: tipAmount,
        message: pickRandom(['Great work!', 'Love your content', 'Keep it up!', 'Thanks for sharing'])[0],
        isAnonymous: random(0, 10) > 7,
      }
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        walletId: receiver.wallet!.id,
        type: 'tip',
        amount: tipAmount,
        fee: Math.floor(tipAmount * 0.05), // 5% platform fee
        status: 'completed',
        description: `Tip from ${sender.profile!.displayName}`,
        relatedTipId: sender.id,
        completedAt: new Date(),
      }
    });

    // Update wallet balances
    await prisma.wallet.update({
      where: { id: receiver.wallet!.id },
      data: {
        balance: { increment: Math.floor(tipAmount * 0.95) },
        totalEarned: { increment: tipAmount }
      }
    });
  }
  console.log(`✅ Created 50 tips and transactions\n`);

  // Create notifications
  console.log('🔔 Creating notifications...');
  for (let i = 0; i < 100; i++) {
    const user = pickRandom(users)[0];
    const types = ['like', 'comment', 'follow', 'tip', 'message'];
    const type = pickRandom(types)[0];

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: type as any,
        title: `New ${type}!`,
        body: `Someone ${type}ed your content`,
        actionUrl: `/${type}/${random(1, 100)}`,
        isRead: random(0, 10) > 6,
        createdAt: new Date(Date.now() - random(0, 7) * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log(`✅ Created 100 notifications\n`);

  // Create some conversations and messages
  console.log('💬 Creating conversations...');
  for (let i = 0; i < 20; i++) {
    const user1 = pickRandom(users)[0];
    const user2 = pickRandom(users.filter(u => u.id !== user1.id))[0];

    try {
      const conversation = await prisma.conversation.create({
        data: {
          participant1Id: user1.id,
          participant2Id: user2.id,
          lastMessageAt: new Date(),
        }
      });

      // Add some messages
      for (let j = 0; j < random(3, 10); j++) {
        const sender = random(0, 1) === 0 ? user1 : user2;
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: sender.id,
            content: pickRandom(['Hey!', 'Thanks for reaching out', 'Sounds good', 'Let me know when you\'re available', 'Great working with you!'])[0],
            type: 'text',
            status: pickRandom(['sent', 'delivered', 'read'])[0],
          }
        });
      }
    } catch (error) {
      // Skip duplicates
    }
  }
  console.log(`✅ Created conversations and messages\n`);

  // Create analytics events
  console.log('📊 Creating analytics events...');
  const eventTypes = ['view', 'like', 'comment', 'share', 'profile_view', 'video_watch'];
  for (let i = 0; i < 500; i++) {
    const user = random(0, 10) > 2 ? pickRandom(users)[0] : null;
    const post = pickRandom(posts)[0];

    await prisma.analyticsEvent.create({
      data: {
        userId: user?.id,
        type: pickRandom(eventTypes)[0] as any,
        entityType: 'post',
        entityId: post.id,
        metadata: {},
        createdAt: new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log(`✅ Created 500 analytics events\n`);

  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Likes: ${likeCount}`);
  console.log(`   Comments: ${commentCount}`);
  console.log(`   Follows: ${followCount}`);
  console.log(`   Gigs: ${gigs.length}`);
  console.log(`   Jobs: 20`);
  console.log(`   Notifications: 100`);
  console.log(`   Analytics Events: 500\n`);
  
  console.log('🔑 Test Account Credentials:');
  console.log('   Admin: admin@embr.app / test1234');
  console.log('   Creator: creator@embr.app / test1234');
  console.log('   User: user@embr.app / test1234\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
