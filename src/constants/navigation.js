import { FiHome, FiInfo } from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
import { PiCarrot } from "react-icons/pi";
import { HiSparkles } from "react-icons/hi2";

import ROUTES from "./routes";

const NAVIGATION = [
  {
    label: "Home",
    href: ROUTES.HOME,
    icon: FiHome,
  },
  {
    label: "Recipes",
    href: ROUTES.DISH,
    icon: LuChefHat,
  },
  {
    label: "Ingredients",
    href: ROUTES.INGREDIENTS,
    icon: PiCarrot,
  },
  {
    label: "Generate Recipe",
    href: ROUTES.GENERATE_RECIPE,
    icon: HiSparkles,
  },
  {
    label: "About",
    href: ROUTES.ABOUT,
    icon: FiInfo,
  },
];

export default NAVIGATION;
