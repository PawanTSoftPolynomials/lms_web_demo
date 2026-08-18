import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
} from "@/services/user.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/**
 * Get All Users
 */
export function useUsers() {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
        queryFn: getUsers,
        ...defaultQueryOptions,
    });
}

/**
 * Get User By ID
 */
export function useUser(userId) {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_USER, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
        ...defaultQueryOptions,
    });
}

/**
 * Update User
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, userData }) =>
            updateUser(userId, userData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USERS],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USER],
            });
        },
    });
}

/**
 * Update User Role
 */
export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }) =>
            updateUserRole(userId, role),

        onSuccess: () => {
            // A role change moves the user between the Students/Instructors
            // lists (and the Admin list), so every one of those views needs
            // to refetch even if it isn't the actively-mounted query.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USERS],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USER],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_STUDENTS],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_INSTRUCTORS],
                refetchType: "all",
            });
        },
    });
}

/**
 * Update User Status
 */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, status }) =>
            updateUserStatus(userId, status),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USERS],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USER],
            });
        },
    });
}

/**
 * Delete User
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ADMIN_USERS],
            });
        },
    });
}