import api from "@/lib/axios";

/**
 * Get All Users
 */
export const getUsers = async () => {
  const { data } = await api.get("/users");

  return data.data;
};

/**
 * Get User By ID
 */
export const getUserById = async (userId) => {
  const { data } = await api.get(`/users/${ userId }`);

  return data.data;
};

/**
 * Update User
 */
export const updateUser = async (
  userId,
  userData
) => {
  const { data } = await api.put(
    `/users/${ userId }`,
    userData
  );

  return data;
};

/**
 * Update User Role
 */
export const updateUserRole = async (
  userId,
  role
) => {
  const { data } = await api.patch(
    `/users/${ userId }/role`,
    { role }
  );

  return data;
};

/**
 * Update User Status
 */
export const updateUserStatus = async (
  userId,
  status
) => {
  const { data } = await api.patch(
    `/users/${ userId }/status`,
    { status }
  );

  return data;
};

/**
 * Delete User
 */
export const deleteUser = async (
  userId
) => {
  const { data } = await api.delete(
    `/users/${ userId }`
  );

  return data;
};