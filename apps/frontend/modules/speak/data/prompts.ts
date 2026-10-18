import {
  Coffee,
  Briefcase,
  Plane,
  Users,
  Heart,
  Brain,
  Code2,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Mode = "drills" | "interview";
type PromptTuple = readonly [text: string, description: string];

interface Category {
  icon: LucideIcon;
  prompts: readonly PromptTuple[];
}


interface ModeData {
  title: string;
  sub: string;
  categories: Record<string, Category>;
}



export const DATA: Record<Mode, ModeData> = {
  drills: {
    title: "Drills",
    sub: "Spin the wheel, get a random prompt, and start speaking.",
    categories: {
      "Daily Life": {
        icon: Coffee,
        prompts: [
          [
            "Talk about your daily routine.",
            "Describe your typical day, what you do, and how you spend your time.",
          ],
          [
            "Describe your morning ritual.",
            "Walk through the first hour after you wake up.",
          ],
          [
            "Explain your favorite meal.",
            "What is in it, who makes it, and why do you love it?",
          ],
        ],
      },
      Travel: {
        icon: Plane,
        prompts: [
          [
            "Describe your ideal vacation.",
            "Where would you go, who with, and what would you do?",
          ],
          [
            "Tell us about a trip you remember.",
            "What happened, and why has it stayed with you?",
          ],
        ],
      },
      Work: {
        icon: Briefcase,
        prompts: [
          [
            "Discuss your future career.",
            "Where do you see yourself in five years, and why?",
          ],
          [
            "Describe your ideal workday.",
            "Think about people, tasks, and environment.",
          ],
        ],
      },
      Social: {
        icon: Users,
        prompts: [
          [
            "Talk about your family.",
            "Who is in it, and what makes them special to you?",
          ],
          [
            "Describe your best friend.",
            "How did you meet and what keeps you close?",
          ],
        ],
      },
      Hobbies: {
        icon: Heart,
        prompts: [
          [
            "Share your hobbies.",
            "What do you do for fun and how did you start?",
          ],
          [
            "Teach us something you love.",
            "Explain a skill or pastime to a complete beginner.",
          ],
        ],
      },
    },
  },
  interview: {
    title: "Interview",
    sub: "Spin for a real interview question and answer out loud.",
    categories: {
      Behavioral: {
        icon: Users,
        prompts: [
          [
            "Tell me about yourself.",
            "Give a 60-second summary of your background and what drives you.",
          ],
          [
            "Describe a time you failed.",
            "What happened, what did you learn, what changed afterward?",
          ],
          [
            "Tell me about a conflict at work.",
            "How did you handle it and what was the outcome?",
          ],
        ],
      },
      Technical: {
        icon: Code2,
        prompts: [
          [
            "Explain a project you're proud of.",
            "Cover the problem, your role, the decisions, and the result.",
          ],
          [
            "Walk through how you debug.",
            "Describe your process for a bug you can't reproduce.",
          ],
        ],
      },
      HR: {
        icon: Briefcase,
        prompts: [
          [
            "Why do you want this job?",
            "Connect the role to your goals and strengths.",
          ],
          [
            "What are your strengths and weaknesses?",
            "Be honest and give a concrete example for each.",
          ],
        ],
      },
      Situational: {
        icon: Target,
        prompts: [
          [
            "You miss a deadline. What do you do?",
            "Explain how you communicate and recover.",
          ],
          [
            "Prioritize three urgent tasks.",
            "How do you decide what comes first?",
          ],
        ],
      },
      Mindset: {
        icon: Brain,
        prompts: [
          [
            "Where do you see yourself in 5 years?",
            "Be specific about skills, impact, and growth.",
          ],
          [
            "How do you handle pressure?",
            "Share a real moment and what you did.",
          ],
        ],
      },
    },
  },
};
