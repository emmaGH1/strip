import LandingOptions from "@/components/home/LandingOptions";

export const meta = () => [
  { title: "Strip — The Sunday strip · Direction A" },
  {
    name: "description",
    content:
      "Release notes nobody reads? Ship a strip. An editorial landing direction for Strip.",
  },
];
export default function LandingA() {
  return <LandingOptions direction="a" />;
}
