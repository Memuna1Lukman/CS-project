import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
  ['CSM 151', 'Structured Programming', 100, 1, 'Dr. K. Owusu'], ['CSM 152', 'Discrete Mathematics', 100, 1, 'Prof. A. Mensah'],
  ['CSM 155', 'Computer Systems Fundamentals', 100, 2, 'Dr. E. Boateng'], ['CSM 158', 'Introduction to Web Technologies', 100, 2, 'Dr. K. Owusu'],
  ['CSM 251', 'Data Structures', 200, 1, 'Prof. A. Mensah'], ['CSM 253', 'Object-Oriented Programming', 200, 1, 'Dr. N. Asante'],
  ['CSM 257', 'Computer Architecture', 200, 2, 'Dr. E. Boateng'], ['CSM 259', 'Database Systems I', 200, 2, 'Dr. N. Asante'],
  ['CSM 351', 'Algorithms', 300, 1, 'Prof. A. Mensah'], ['CSM 353', 'Operating Systems', 300, 1, 'Dr. K. Owusu'],
  ['CSM 357', 'Software Engineering', 300, 2, 'Dr. E. Boateng'], ['CSM 359', 'Computer Networks', 300, 2, 'Dr. N. Asante'],
  ['CSM 451', 'Artificial Intelligence', 400, 1, 'Prof. A. Mensah'], ['CSM 453', 'Distributed Systems', 400, 1, 'Dr. K. Owusu'],
  ['CSM 457', 'Final Year Project', 400, 2, 'Dept. Coordinator'], ['CSM 459', 'Cybersecurity', 400, 2, 'Dr. N. Asante'],
] as const;

async function main() {
  const department = await prisma.department.upsert({
    where: { name: 'Computer Science' }, update: {}, create: { name: 'Computer Science' },
  });

  await Promise.all(courses.map(([code, title, level, semester, lecturer]) => prisma.course.upsert({
    where: { code }, update: { title, level, semester, lecturer, departmentId: department.id },
    create: { code, title, level, semester, lecturer, departmentId: department.id },
  })));
  console.log(`Seeded ${courses.length} Computer Science courses.`);
}

main().finally(() => prisma.$disconnect());
