import '../build/variables.css';
import '../storybook/designTokens.js';

// This is a test comment so that I can test the git commit

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
