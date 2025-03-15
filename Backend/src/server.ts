import app from "./app";
import prisma from "./prisma";
console.log("Modelos de Prisma:", Object.keys(prisma));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
