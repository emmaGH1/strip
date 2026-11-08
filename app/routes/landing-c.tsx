import LandingOptions from "@/components/home/LandingOptions";

export const meta = () => [
  { title: "Strip — The launch broadside · Direction C" },
  {
    name: "description",
    content:
      "Small update. Good story. Turn a product update into a four-panel launch post with Strip.",
  },
];
export default function LandingC() {
  return <LandingOptions direction="c" />;
}
