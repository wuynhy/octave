import { Outlet, Navigate } from "react-router-dom";
import useToken from "@galvanize-inc/jwtdown-for-react";

const PrivateRoutes = () => {
  let auth = useToken();
  return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
