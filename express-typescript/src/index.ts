import { createApp } from "./createApp";
const app = createApp();
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});