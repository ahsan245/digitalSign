import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default templates
  const defaultTemplates = [
    {
      name: 'Social Media Square',
      description: 'Perfect for Instagram posts and social media squares (1080x1080)',
      width: 1080,
      height: 1080,
      quality: 85,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isDefault: true,
      isActive: true
    },
    {
      name: 'YouTube Thumbnail',
      description: 'Optimized for YouTube video thumbnails (1280x720)',
      width: 1280,
      height: 720,
      quality: 90,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Profile Picture',
      description: 'Standard profile picture size (400x400)',
      width: 400,
      height: 400,
      quality: 85,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Web Optimized',
      description: 'Optimized for web usage with smaller file size (800x600)',
      width: 800,
      height: 600,
      quality: 70,
      format: 'webp',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Print Ready',
      description: 'High quality for print materials (3000x2000)',
      width: 3000,
      height: 2000,
      quality: 95,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: false,
      stripMetadata: false,
      isActive: true
    },
    {
      name: 'Mobile Banner',
      description: 'Mobile app banner format (750x1334)',
      width: 750,
      height: 1334,
      quality: 80,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Facebook Cover',
      description: 'Facebook cover photo dimensions (851x315)',
      width: 851,
      height: 315,
      quality: 85,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Twitter Header',
      description: 'Twitter header image dimensions (1500x500)',
      width: 1500,
      height: 500,
      quality: 85,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'Blog Post Thumbnail',
      description: 'Standard blog post thumbnail (800x450)',
      width: 800,
      height: 450,
      quality: 80,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      isActive: true
    },
    {
      name: 'E-commerce Product',
      description: 'E-commerce product image (600x600)',
      width: 600,
      height: 600,
      quality: 90,
      format: 'jpeg',
      fit: 'cover',
      resizeMode: 'cover',
      progressive: true,
      stripMetadata: true,
      backgroundColor: '#ffffff',
      isActive: true
    }
  ];

  console.log('Creating default templates...');
  
  for (const template of defaultTemplates) {
    try {
      const created = await prisma.template.upsert({
        where: { name: template.name },
        update: template,
        create: template
      });
      console.log(`✅ Created/Updated template: ${created.name}`);
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error.message);
    }
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
