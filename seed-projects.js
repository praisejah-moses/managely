#!/usr/bin/env node

/**
 * Seed script to populate the platform with 30 sample projects
 * Usage: node seed-projects.js <email> <password>
 * Example: node seed-projects.js admin@example.com password123
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:5000";

// Sample data generators
const projectNames = [
  "Website Redesign",
  "Mobile App Development",
  "Marketing Campaign Q1",
  "Product Launch",
  "Customer Portal",
  "API Integration",
  "Database Migration",
  "UI/UX Refresh",
  "E-commerce Platform",
  "Analytics Dashboard",
  "Security Audit",
  "Performance Optimization",
  "Social Media Strategy",
  "Content Management System",
  "Payment Gateway Integration",
  "Inventory Management",
  "HR Management System",
  "Email Marketing Automation",
  "Cloud Infrastructure Setup",
  "DevOps Pipeline",
  "Testing Framework",
  "Documentation Update",
  "User Onboarding Flow",
  "Feature Expansion",
  "Bug Fixes Sprint",
  "Technical Debt Cleanup",
  "Market Research",
  "Competitor Analysis",
  "SEO Optimization",
  "Accessibility Improvements",
];

const taskTemplates = [
  "Research and planning",
  "Design mockups",
  "Setup development environment",
  "Implement core features",
  "Write unit tests",
  "Integration testing",
  "User acceptance testing",
  "Deploy to staging",
  "Code review",
  "Documentation",
  "Performance testing",
  "Security review",
  "Deploy to production",
  "Post-launch monitoring",
  "Gather user feedback",
];

const peopleNames = [
  { name: "Alice Johnson", email: "alice.johnson@example.com" },
  { name: "Bob Smith", email: "bob.smith@example.com" },
  { name: "Charlie Brown", email: "charlie.brown@example.com" },
  { name: "Diana Prince", email: "diana.prince@example.com" },
  { name: "Ethan Hunt", email: "ethan.hunt@example.com" },
  { name: "Fiona Green", email: "fiona.green@example.com" },
  { name: "George Wilson", email: "george.wilson@example.com" },
  { name: "Hannah Lee", email: "hannah.lee@example.com" },
  { name: "Ian Malcolm", email: "ian.malcolm@example.com" },
  { name: "Julia Roberts", email: "julia.roberts@example.com" },
  { name: "Kevin Hart", email: "kevin.hart@example.com" },
  { name: "Laura Croft", email: "laura.croft@example.com" },
  { name: "Michael Scott", email: "michael.scott@example.com" },
  { name: "Nancy Drew", email: "nancy.drew@example.com" },
  { name: "Oliver Queen", email: "oliver.queen@example.com" },
  { name: "Patricia Hill", email: "patricia.hill@example.com" },
  { name: "Quincy Adams", email: "quincy.adams@example.com" },
  { name: "Rachel Green", email: "rachel.green@example.com" },
  { name: "Steve Rogers", email: "steve.rogers@example.com" },
  { name: "Tina Turner", email: "tina.turner@example.com" },
];

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDescription(projectName) {
  const descriptions = [
    `Comprehensive ${projectName.toLowerCase()} project focused on delivering high-quality results within the specified timeline.`,
    `Strategic initiative to ${projectName.toLowerCase()} with emphasis on user experience and scalability.`,
    `End-to-end implementation of ${projectName.toLowerCase()} following best practices and industry standards.`,
    `Critical project for ${projectName.toLowerCase()} aimed at improving efficiency and customer satisfaction.`,
    `Innovative approach to ${projectName.toLowerCase()} leveraging modern technologies and methodologies.`,
  ];
  return descriptions[getRandomInt(0, descriptions.length - 1)];
}

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "API call failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function login(email, password) {
  console.log("🔐 Logging in...");
  const response = await apiCall("/auth", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.success) {
    throw new Error(`Login failed: ${response.error}`);
  }

  // Extract token from response
  const token = response.data.access_token || response.data.token;
  if (!token) {
    throw new Error("No token received from login");
  }

  console.log("✅ Login successful");
  return token;
}

async function getAllProjects(token) {
  return apiCall("/projects", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function createProject(token, projectData) {
  return apiCall("/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });
}

async function createUser(name, email, password) {
  return apiCall("/auth", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      isSignup: true,
    }),
  });
}

async function getAllUsers(token) {
  return apiCall("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function generateProjectData(index, registeredUsers) {
  const name = projectNames[index];
  const description = generateDescription(name);
  const taskCount = getRandomInt(3, 8);
  const peopleCount = getRandomInt(2, 5);

  const tasks = getRandomItems(taskTemplates, taskCount).map((text) => ({
    text,
  }));

  // Select people from registered users
  const selectedPeople = getRandomItems(registeredUsers, peopleCount);
  const people = selectedPeople.map((user) => ({
    name: user.name,
    email: user.email,
  }));

  return {
    name,
    description,
    tasks,
    people,
    completed: false,
  };
}

async function seedProjects(email, password) {
  try {
    console.log("🌱 Starting project seeding process...\n");

    // Login to get authentication token
    const token = await login(email, password);

    // Register sample users first
    console.log("👤 Creating sample user accounts...");
    const registeredUsers = [];
    let userCreateCount = 0;

    for (const person of peopleNames) {
      process.stdout.write(`  Creating user: ${person.name}... `);
      const userResponse = await createUser(
        person.name,
        person.email,
        "Password123!" // Default password for seed users
      );

      if (userResponse.success) {
        registeredUsers.push({
          name: person.name,
          email: person.email,
        });
        userCreateCount++;
        console.log("✅");
      } else {
        // User might already exist, try to fetch all users instead
        console.log("⚠️ (might already exist)");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Fetch all registered users to ensure we have the complete list
    console.log("\n📋 Fetching all registered users...");
    const usersResponse = await getAllUsers(token);

    if (usersResponse.success && usersResponse.data) {
      // Use the fetched users list
      usersResponse.data.forEach((user) => {
        if (!registeredUsers.find((u) => u.email === user.email)) {
          registeredUsers.push({
            name: user.name,
            email: user.email,
          });
        }
      });
    }

    console.log(
      `✅ ${registeredUsers.length} registered users available for projects\n`
    );

    console.log(`📦 Creating 30 projects...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < 30; i++) {
      const projectData = generateProjectData(i, registeredUsers);

      process.stdout.write(
        `Creating project ${i + 1}/30: "${projectData.name}"... `
      );

      const response = await createProject(token, projectData);

      if (response.success) {
        successCount++;
        console.log("✅");
      } else {
        failCount++;
        console.log(`❌ (${response.error})`);
      }

      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`✅ Successfully created: ${successCount} projects`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} projects`);
    }
    console.log(
      `👥 Used ${registeredUsers.length} registered users for project assignments`
    );
    console.log("");
  } catch (error) {
    console.error("\n❌ Error during seeding:", error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("Usage: node seed-projects.js <email> <password>");
  console.log("Example: node seed-projects.js admin@example.com password123");
  console.log("");
  console.log("Environment variables:");
  console.log(
    "  API_URL - Base URL of the API (default: http://localhost:3001)"
  );
  process.exit(1);
}

const [email, password] = args;

seedProjects(email, password);
