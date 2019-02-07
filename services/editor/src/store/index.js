import { createContext } from "react";
import configureStore from "./configureStore";

export const store = configureStore({});
export const ReduxContext = createContext();