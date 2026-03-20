import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create SUPERADMIN role
  const role = await prisma.role.upsert({
    where: { code: "SUPERADMIN" },
    update: {},
    create: {
      name: "Super Administrador",
      code: "SUPERADMIN",
      description: "Control total del sistema Rous Boutique",
    },
  });

  // Create other roles
  const rolesToCreate = [
    { name: "Administrador", code: "ADMIN" as const, description: "Administrador de sucursal" },
    { name: "Gerente", code: "MANAGER" as const, description: "Gerente de sucursal" },
    { name: "Empleado", code: "STAFF" as const, description: "Empleado de tienda" },
    { name: "Mantenimiento", code: "MAINTENANCE" as const, description: "Personal de limpieza y soporte" },
  ];

  for (const r of rolesToCreate) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }

  // Create SUPERADMIN auth + employee
  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  const auth = await prisma.auth.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: hashedPassword,
      isActive: true,
      accountType: "EMPLOYEE",
    },
  });

  await prisma.employee.upsert({
    where: { authId: auth.id },
    update: {},
    create: {
      authId: auth.id,
      roleId: role.id,
      firstName: "Super",
      lastName: "Admin",
      ci: "0000001",
    },
  });

  console.log("✅ Seed completado:");
  console.log("   Usuario: superadmin");
  console.log("   Contraseña: Admin123!");
  console.log("   Rol: SUPERADMIN");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
