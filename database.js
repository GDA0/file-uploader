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

async function findUser(method, value) {
  try {
    let user;

    if (method === "username") {
      user = await prisma.user.findUnique({
        where: { username: value },
      });
    } else if (method === "id") {
      user = await prisma.user.findUnique({
        where: { id: value },
      });
    } else {
      throw new Error('Invalid method. Use "username" or "id".');
    }

    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function createDefaultFolder(userId) {
  try {
    await prisma.folder.create({
      data: {
        name: "Home",
        userId,
      },
    });
  } catch (error) {
    console.error("Error creating default folder:", error);
    throw error;
  }
}

async function findFolder(folderId) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        subfolders: true,
        files: true,
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return folder;
  } catch (error) {
    console.error(`Error finding folder with ID ${folderId}:`, error);
    throw error;
  }
}

async function createFile(name, path, folderId, size) {
  try {
    await prisma.file.create({
      data: {
        name,
        path,
        folderId,
        size,
      },
    });
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
}

async function createFolder(name, userId, parentId) {
  try {
    await prisma.folder.create({
      data: {
        name,
        userId,
        parentId,
      },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

async function checkFilenameExist(name, folderId) {
  try {
    const file = await prisma.file.findFirst({
      where: { name, folderId },
    });
    return file !== null;
  } catch (error) {
    console.error("Error checking file existence:", error);
    throw error;
  }
}

async function checkFoldernameExist(name, parentId) {
  try {
    const folder = await prisma.folder.findFirst({
      where: { name, parentId },
    });
    return folder !== null;
  } catch (error) {
    console.error("Error checking folder existence:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  checkUsernameExists,
  findUser,
  createDefaultFolder,
  findFolder,
  createFile,
  createFolder,
  checkFilenameExist,
  checkFoldernameExist,
};
