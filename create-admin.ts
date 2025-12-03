
import { PrismaClient } from '@prisma/client';

// This script is intended to be run from the command line, e.g., ts-node create-admin.ts

const prisma = new PrismaClient();

const createAdmin = async () => {
  const adminEmail = 'kalicentrodeportivotemixco@gmail.com';
  const adminPassword = 'j5s82QSM'; // This is temporary and should be changed

  console.log(`Checking if admin user with email ${adminEmail} already exists...`);

  // We need to interact with Supabase Auth, which Prisma doesn't do directly.
  // The correct way to do this is by using a Supabase client, but we don't have one here.
  // This script is therefore a placeholder to illustrate the logic.
  // A real implementation would require using the Supabase Admin SDK.
  
  // Since I cannot run the Supabase specific functions, I will prepare the SQL for you.
  // The following Prisma query is a simulation of what needs to happen.
  
  // 1. A user would be created in Supabase Auth.
  // const { user, error } = await supabase.auth.signUp({ email: adminEmail, password: adminPassword });
  // if (error) {
  //   throw new Error(`Could not sign up admin user: ${error.message}`);
  // }
  // const userId = user.id;

  // 2. A profile would be created and linked.
  const newUser = await prisma.profiles.create({
    data: {
      // This user_id should come from the auth user created above.
      // Since I can't get it, I will use a placeholder.
      // YOU WILL NEED TO REPLACE THIS with the actual user_id from Supabase Auth.
      user_id: 'auth-user-id-placeholder', 
      first_name: 'Super',
      paternal_last_name: 'Admin',
      email: adminEmail,
      role: 'admin',
      status: 'activo', // Assuming 'activo' is a valid status
    },
  });

  console.log('Admin user profile simulated successfully!');
  console.log(newUser);
};

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
