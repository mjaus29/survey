import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const survey = await prisma.survey.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Default Survey" },
  });

  const questions = [
    {
      code: "full-name",
      surveyId: survey.id,
      title: "Full Name",
      description: "What is your full name?",
      type: "text",
      required: true,
    },
    {
      code: "dob",
      surveyId: survey.id,
      title: "Date of Birth",
      description: "What is your date of birth?",
      type: "date",
      required: true,
    },
    {
      code: "gender",
      surveyId: survey.id,
      title: "Gender",
      description: "What is your gender?",
      type: "radio",
      required: true,
      options: ["Male", "Female", "Other"],
    },
    {
      code: "marital-status",
      surveyId: survey.id,
      title: "Marital Status",
      description: "What is your marital status?",
      type: "select",
      required: true,
      options: ["Single", "Married", "Divorced", "Widowed"],
    },
    {
      code: "annual-income",
      surveyId: survey.id,
      title: "Annual Income",
      description: "What is your annual income?",
      type: "currency",
      required: true,
    },
    {
      code: "health-conditions",
      surveyId: survey.id,
      title: "Health Conditions",
      description: "Do you have any pre-existing health conditions?",
      type: "checkbox",
      required: true,
      options: ["Diabetes", "Hypertension", "Asthma", "None"],
    },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: {
        code: q.code,
      },
      update: {
        ...q,
      },
      create: {
        ...q,
      },
    });
  }

  const codeInSeed = questions.map((q) => q.code);
  await prisma.question.deleteMany({
    where: { code: { notIn: codeInSeed } },
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
