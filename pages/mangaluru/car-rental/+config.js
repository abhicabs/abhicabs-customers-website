import { CITY_CONTENT } from "../../../src/content/cityDefaults";

const city = CITY_CONTENT["mangaluru"];

export default {
  title: city?.seo?.title || "Car Booking | Abhi Cabs",
  description: city?.seo?.description || "Book cars with Abhi Cabs 24×7.",
};
