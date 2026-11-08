import LandingOptions from "@/components/home/LandingOptions";

export const meta = () => [
  { title: "Strip — The inking desk · Direction B" },
  {
    name: "description",
    content:
      "Good agents leave your line alone. Explore the pencil-to-ink loop in Strip.",
  },
];
export default function LandingB() {
  return <LandingOptions direction="b" />;
}
