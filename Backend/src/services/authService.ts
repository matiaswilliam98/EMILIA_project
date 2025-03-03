import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const registerUser = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const { email, password } = data;

    console.log("🔍 Buscando usuario en la BD:", email);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("⚠️ Usuario ya existe:", existingUser);
      throw new Error("El correo ya está registrado.");
    }

    console.log("🔑 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("📝 Creando usuario en PostgreSQL...");
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        token: null,
      },
    });

    console.log("✅ Usuario registrado correctamente:", newUser);
    return newUser;
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    throw error;
  }
};

// ✅ Añadir estas funciones si no existen
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuario no encontrado.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Contraseña incorrecta.");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  await prisma.user.update({ where: { id: user.id }, data: { token } });

  return { token, user };
};

export const logoutUser = async (userId: number) => {
  await prisma.user.update({ where: { id: userId }, data: { token: null } });
};
