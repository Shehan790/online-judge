import "dotenv/config";
import { PrismaClient, Difficulty } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();

  const problems = [
    {
      slug: 'two-sum',
      title: 'Two Sum',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      difficulty: "EASY",
      tags: ['array', 'hash-table'],
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: {
        create: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true, isHidden: false },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true, isHidden: false },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', isSample: true, isHidden: false },
          { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isSample: false, isHidden: true },
        ],
      },
    },
    {
      slug: 'reverse-string',
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with `O(1)` extra memory.',
      difficulty: "EASY",
      tags: ['string', 'two-pointers'],
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: {
        create: [
          { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isSample: true, isHidden: false },
          { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isSample: true, isHidden: false },
          { input: '["A"," ","B"]', expectedOutput: '["B"," ","A"]', isSample: false, isHidden: true },
        ],
      },
    },
    {
      slug: 'fizzbuzz',
      title: 'FizzBuzz',
      description: 'Given an integer `n`, return a string array `answer` (1-indexed) where:\n\n* `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.\n* `answer[i] == "Fizz"` if `i` is divisible by 3.\n* `answer[i] == "Buzz"` if `i` is divisible by 5.\n* `answer[i] == i` (as a string) if none of the above conditions are true.',
      difficulty: "EASY",
      tags: ['math', 'string', 'simulation'],
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: {
        create: [
          { input: '3', expectedOutput: '["1","2","Fizz"]', isSample: true, isHidden: false },
          { input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]', isSample: true, isHidden: false },
          { input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isSample: true, isHidden: false },
          { input: '1', expectedOutput: '["1"]', isSample: false, isHidden: true },
        ],
      },
    },
    {
      slug: 'palindrome-check',
      title: 'Palindrome Check',
      description: 'Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.\n\nA string is a palindrome when it reads the same backward as forward.',
      difficulty: "EASY",
      tags: ['string', 'two-pointers'],
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: {
        create: [
          { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isSample: true, isHidden: false },
          { input: '"race a car"', expectedOutput: 'false', isSample: true, isHidden: false },
          { input: '" "', expectedOutput: 'true', isSample: true, isHidden: false },
          { input: '"abccba"', expectedOutput: 'true', isSample: false, isHidden: true },
        ],
      },
    },
    {
      slug: 'factorial',
      title: 'Factorial',
      description: 'Given an integer `n`, return the factorial of `n`.\n\nThe factorial of a non-negative integer `n`, denoted by `n!`, is the product of all positive integers less than or equal to `n`.',
      difficulty: "EASY",
      tags: ['math', 'recursion'],
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: {
        create: [
          { input: '5', expectedOutput: '120', isSample: true, isHidden: false },
          { input: '0', expectedOutput: '1', isSample: true, isHidden: false },
          { input: '3', expectedOutput: '6', isSample: true, isHidden: false },
          { input: '10', expectedOutput: '3628800', isSample: false, isHidden: true },
        ],
      },
    },
  ];

  for (const p of problems) {
       await prisma.problem.create({
      data: { ...p, difficulty: p.difficulty as Difficulty },
    });
  }
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
