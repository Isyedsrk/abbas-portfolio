import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dbPath = path.join(__dirname, '../db/projects.db');

// Project data
const projects = [
  {
    id: 1,
    title: 'Learning with AR',
    description:
      'Learning with AR enhances education by providing immersive, interactive experiences that make complex concepts easier to understand.',
    links: '',
  },
  {
    id: 2,
    title: 'Obliviate',
    description:
      'Obliviate is a fast-paced 3D game where players control a ball moving forward, dodging obstacles in a run',
    links: 'https://github.com/Isyedsrk/OBLIVIATE',
  },
  {
    id: 3,
    title: 'Fruit-Slicer',
    description:
      'Fruit-Slicer is an exciting 2D game where players slice flying fruits with swift swipes, aiming for high scores in a fast-paced challenge.',
    links: 'https://github.com/Isyedsrk/Fruit-Slicer',
  },
  {
    id: 4,
    title: 'Apna super bazaar',
    description:
      'Apna Super Bazaar is an e-commerce website offering a wide range of products, providing a convenient and seamless online shopping experience.',
    links: 'https://github.com/Isyedsrk/E-Commerce-website',
  },
  {
    id: 5,
    title: 'Healthease',
    description:
      'Healthease is an Android app that simplifies booking lab tests and medical appointments, offering easy access to healthcare services.',
    links: 'https://github.com/Isyedsrk/Healthcare',
  },
  {
    id: 6,
    title: 'DAR',
    description:
      'DAR is a detection and recognition system app that accurately identifies and detects text, objects, and faces in real-time.',
    links: 'https://github.com/Isyedsrk/DAR-Detect-Recognize-',
  },
  {
    id: 7,
    title: 'Bigg Boss – App Room',
    description:
      'A real-time interactive touchscreen application developed for Bigg Boss Season 19. Features real-time touchscreen interaction, backend-driven option flow, multi-layer decision system, and media playback (video, image, audio).',
    links: '',
  },
  {
    id: 8,
    title: 'Party Room',
    description:
      'A real-time web application that allows users to watch videos together in sync. Features synchronized video playback, host-controlled play and pause, room creation and invitations, and a friend request system.',
    links: '',
  },
];

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });

    db.run(
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        links TEXT,
        embedding TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        resolve(db);
      }
    );
  });
}

async function generateEmbedding(text) {
  try {
    // Use Xenova transformers for local embeddings
    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Convert to array
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function embedProjects() {
  try {
    console.log('Initializing database...');
    const db = await initializeDatabase();

    console.log('Clearing existing data...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM projects', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Loading Xenova embedding model...');
    console.log('This may take a minute on first run (downloading model)...');

    for (const project of projects) {
      // Create text for embedding (title + description)
      const textToEmbed = `${project.title}. ${project.description}`;

      console.log(`Processing: ${project.title}...`);

      const embedding = await generateEmbedding(textToEmbed);

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO projects (id, title, description, links, embedding) VALUES (?, ?, ?, ?, ?)',
          [project.id, project.title, project.description, project.links || '', JSON.stringify(embedding)],
          (err) => {
            if (err) reject(err);
            else {
              console.log(`✓ Inserted: ${project.title}`);
              resolve();
            }
          }
        );
      });
    }

    db.close();
    console.log('\n✅ All projects embedded and stored successfully!');
  } catch (error) {
    console.error('Error embedding projects:', error);
    process.exit(1);
  }
}

// Run the script
embedProjects();
