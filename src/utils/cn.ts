type ClassValue = string | number | boolean | undefined | null;
type ClassObject = Record<string, boolean | undefined | null>;
type ClassArray = ClassValue[];
type ClassInput = ClassValue | ClassObject | ClassArray;
export function cn(...inputs: ClassInput[]): string {
  const classes = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      if (Array.isArray(input)) {
        classes.push(cn(...input));
      } else {
        for (const [key, value] of Object.entries(input)) {
          if (value) classes.push(key);
        }
      }
    }
  }
  return classes.filter(Boolean).join(' ');
}