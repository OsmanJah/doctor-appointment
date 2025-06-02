/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer } from "react";

const storedUser = localStorage.getItem("user");

const initial_state = {
  user: storedUser && storedUser !== 'undefined' && storedUser !== 'null'
    ? JSON.parse(storedUser)
    : null,
  token: localStorage.getItem("token") || "", // Keep as is, empty string is a fine default
  role: localStorage.getItem("role") || "",   // Keep as is
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        token: "",
        role: "",
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        token: "",
        role: "",
      };

    case "LOGOUT":
      return {
        user: null,
        token: "",
        role: "",
      };

    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", state.token);
    localStorage.setItem("role", state.role);
  }, [state]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
