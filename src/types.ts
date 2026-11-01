export type AppActions = {
  navigate: (path: string) => void;
  toast: (message: string) => void;
  toggleSaved: (id: string) => void;
  apply: (id: string, title: string) => void;
  savedIds: string[];
  appliedIds: string[];
};
