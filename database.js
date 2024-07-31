const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUser(firstName, lastName, username, password) {
  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        password,
      },
    });

    return user;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

async function checkUsernameExists(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user !== null; // returns true if user exists, false otherwise
  } catch (error) {
    console.error("Error checking username existence:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  checkUsernameExists,
};
