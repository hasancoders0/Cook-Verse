const suggestions = [
  {
    id: 1,
    title: "Chicken Biryani",
    prompt: "I have chicken, rice, onion, garlic and yogurt. What can I cook?",
  },
  {
    id: 2,
    title: "Beef Burger",
    prompt: "I have ground beef, burger buns, lettuce, tomato and cheese.",
  },
  {
    id: 3,
    title: "Vegetable Salad",
    prompt:
      "I have cucumber, tomato, lettuce and carrots. Suggest a healthy recipe.",
  },
  {
    id: 4,
    title: "Spicy Dinner",
    prompt: "Recommend a spicy chicken recipe for dinner.",
  },
  {
    id: 5,
    title: "Healthy Lunch",
    prompt: "I want a healthy vegetable meal for lunch.",
  },
  {
    id: 6,
    title: "Use My Ingredients",
    prompt: "I have rice, chicken and yogurt. What recipe matches best?",
  },
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="mt-8">
      <p className="mb-4 text-sm font-medium text-gray-500">
        Try one of these prompts
      </p>

      <div className="flex flex-wrap gap-3">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
