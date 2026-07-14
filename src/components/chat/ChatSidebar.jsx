"use client";

import { useState, useMemo, useEffect } from "react";
import ChatSearch from "./ChatSearch";
import ChatUserCard from "./ChatUserCard";
import ChatAvatar from "./ChatAvatar";
import OnlineBadge from "./OnlineBadge";

import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { getMyEnrollments, getEnrollments } from "@/services/enrollment.service";
import { getCourseById, getCourses } from "@/services/course.service";
import { getStudents } from "@/services/student.service";
import { createConversation, getLocalConvs, saveLocalConvs } from "@/features/chat/api/chat.api";

export default function ChatSidebar() {
  const {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    sidebarMode,
    setSidebarMode,
    onlineUsers,
  } = useChat();

  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch course-related users (classmates/teachers) when in 'users' mode
  useEffect(() => {
    if (sidebarMode === "users" && users.length === 0) {
      const fetchCourseRelatedUsers = async () => {
        try {
          setLoadingUsers(true);
          const uniqueUsersMap = new Map();

          const getContactId = (item) => {
            if (!item) return null;
            return item.user?.id || item.user?._id || 
                   item.student?.user?.id || item.student?.user?._id || 
                   item.creator?.id || item.creator?._id || 
                   item.instructor?.id || item.instructor?._id || 
                   item.id || item._id;
          };

          const getContactName = (item) => {
            if (!item) return "User";
            if (item.name) return item.name;
            return item.user?.name || item.student?.name || item.student?.user?.name || item.creator?.name || item.instructor?.name || "Student";
          };

          const getContactRole = (item, defaultRole = "STUDENT") => {
            if (!item) return defaultRole;
            if (item.role) return item.role;
            return item.user?.role || item.student?.role || item.student?.user?.role || item.creator?.role || defaultRole;
          };

          const getContactEmail = (item) => {
            if (!item) return "";
            if (item.email) return item.email;
            return item.user?.email || item.student?.email || item.student?.user?.email || item.creator?.email || "";
          };

          const getContactAvatar = (item) => {
            if (!item) return null;
            if (item.avatar) return item.avatar;
            return item.user?.avatar || item.student?.avatar || item.student?.user?.avatar || item.creator?.avatar || null;
          };

          const currentUserId = user?.id || user?._id;

          if (user?.role === "INSTRUCTOR") {
            // Instructor Path: Find students enrolled in their courses
            let allCourses = [];
            try {
              allCourses = await getCourses();
            } catch (courseErr) {
              console.warn("Failed to get courses:", courseErr);
            }
            
            const myCourses = (allCourses || []).filter((c) => {
              if (!c) return false;
              const courseCreatorId = c.creatorId || c.creator?.id || c.creator?._id || c.instructor?.id || c.instructor?._id;
              return courseCreatorId && currentUserId && courseCreatorId.toString() === currentUserId.toString();
            });

            let enrolledStudentFound = false;

            if (myCourses.length > 0) {
              for (const courseItem of myCourses) {
                const targetCourseId = courseItem.id || courseItem._id;
                if (!targetCourseId) continue;

                try {
                  const courseEnrollments = await getEnrollments(null, targetCourseId);
                  if (courseEnrollments && courseEnrollments.length > 0) {
                    courseEnrollments.forEach((e) => {
                      const classmate = e.student?.user || e.user || e;
                      const classmateId = getContactId(classmate);
                      if (classmateId && classmateId !== currentUserId) {
                        uniqueUsersMap.set(classmateId, {
                          id: classmateId,
                          name: getContactName(classmate),
                          role: getContactRole(classmate, "STUDENT"),
                          email: getContactEmail(classmate),
                          avatar: getContactAvatar(classmate)
                        });
                        enrolledStudentFound = true;
                      }
                    });
                  }
                } catch (enrollErr) {
                  console.warn(`getEnrollments failed for course ${targetCourseId}:`, enrollErr);
                }
              }
            }

            // Fallback: If no enrolled students were found (either getEnrollments failed, or no courses, or no enrollments),
            // fetch all students from the system so the instructor can still start a conversation!
            if (!enrolledStudentFound || uniqueUsersMap.size === 0) {
              console.log("No course-enrolled students found. Loading all students as fallback...");
              try {
                const studentRes = await getStudents();
                const studentsList = studentRes?.data || studentRes || [];
                studentsList.forEach((s) => {
                  const studentUser = s.user || s;
                  const studentId = getContactId(studentUser);
                  if (studentId && studentId !== currentUserId) {
                    uniqueUsersMap.set(studentId, {
                      id: studentId,
                      name: getContactName(studentUser),
                      role: getContactRole(studentUser, "STUDENT"),
                      email: getContactEmail(studentUser),
                      avatar: getContactAvatar(studentUser)
                    });
                  }
                });
              } catch (studErr) {
                console.warn("getStudents fallback failed:", studErr);
              }
            }
          } else {
            // Student Path: Find classmates and instructors for enrolled courses
            const enrollments = await getMyEnrollments();
            
            if (enrollments && enrollments.length > 0) {
              for (const enrollment of enrollments) {
                const courseObj = enrollment.course || enrollment;
                const targetCourseId = courseObj.id || enrollment.courseId || courseObj._id;
                
                if (!targetCourseId) continue;
                
                // Add Course Creator/Instructor (Force fetch details to get creator object populated)
                let courseDetails = enrollment.course;
                if (!courseDetails || !courseDetails.creator) {
                  try {
                    const fetchedCourse = await getCourseById(targetCourseId);
                    courseDetails = fetchedCourse?.data || fetchedCourse || courseDetails;
                  } catch (err) {
                    console.warn(`Failed to fetch course details for ${targetCourseId}:`, err);
                  }
                }
                const creator = courseDetails?.creator || courseDetails?.instructor || courseDetails?.creatorId;
                const creatorId = getContactId(creator);
                
                if (creatorId && creatorId !== currentUserId) {
                  uniqueUsersMap.set(creatorId, {
                    id: creatorId,
                    name: getContactName(creator) || "Instructor",
                    role: getContactRole(creator, "INSTRUCTOR"),
                    email: getContactEmail(creator),
                    avatar: getContactAvatar(creator)
                  });
                }
                
                // Add Classmates
                const courseEnrollments = await getEnrollments(null, targetCourseId);
                if (courseEnrollments) {
                  courseEnrollments.forEach((e) => {
                    const classmate = e.student?.user || e.user || e;
                    const classmateId = getContactId(classmate);
                    if (classmateId && classmateId !== currentUserId) {
                      uniqueUsersMap.set(classmateId, {
                        id: classmateId,
                        name: getContactName(classmate),
                        role: getContactRole(classmate, "STUDENT"),
                        email: getContactEmail(classmate),
                        avatar: getContactAvatar(classmate)
                      });
                    }
                  });
                }
              }
            }
          }

          const list = Array.from(uniqueUsersMap.values());
          if (list.length > 0) {
            setUsers(list);
          } else {
            console.log("No real classmates/instructors found in DB, using mock directory fallbacks");
            setUsers([
              { id: "mock_user_1", name: "Professor Alan", role: "INSTRUCTOR", email: "alan@lms.com" },
              { id: "mock_user_2", name: "Sarah Connor", role: "STUDENT", email: "sarah@lms.com" },
              { id: "mock_user_3", name: "Super Admin", role: "ADMIN", email: "admin@lms.com" },
              { id: "mock_user_4", name: "Java Expert", role: "INSTRUCTOR", email: "java@lms.com" }
            ]);
          }
        } catch (err) {
          console.warn("Failed to load course-related contacts, falling back to mocks:", err);
          setUsers([
            { id: "mock_user_1", name: "Professor Alan", role: "INSTRUCTOR", email: "alan@lms.com" },
            { id: "mock_user_2", name: "Sarah Connor", role: "STUDENT", email: "sarah@lms.com" },
            { id: "mock_user_3", name: "Super Admin", role: "ADMIN", email: "admin@lms.com" },
            { id: "mock_user_4", name: "Java Expert", role: "INSTRUCTOR", email: "java@lms.com" }
          ]);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchCourseRelatedUsers();
    }
  }, [sidebarMode, users.length]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    return list.filter((conversation) =>
      (conversation?.name || "Unknown User")
        .toLowerCase()
        .includes((search || "").toLowerCase())
    );
  }, [conversations, search]);

  // Filter users
  const filteredUsers = useMemo(() => {
    const query = (search || "").toLowerCase();
    return users.filter((u) => {
      if (u.id === user?.id || u.email === user?.email) return false;
      return (
        (u.name || "").toLowerCase().includes(query) ||
        (u.role || "").toLowerCase().includes(query)
      );
    });
  }, [users, search, user]);

  const handleStartChat = async (selectedUser) => {
    try {
      const existing = conversations.find(
        (c) =>
          !c.isGroup &&
          c.participants?.some((p) => {
            const pId = p.userId || p.user?.id || p.id;
            const pEmail = p.user?.email || p.email;
            return pId === selectedUser.id || pEmail === selectedUser.email;
          })
      );

      if (existing) {
        setActiveConversation(existing);
        setSidebarMode("chats");
        setSearch("");
        return;
      }

      const response = await createConversation({
        name: selectedUser.name,
        isGroup: false,
        participantIds: [selectedUser.id],
        participants: [selectedUser.id]
      });

      const newConv = response.data || response;
      setConversations((prev) => {
        if (prev.some((c) => c.id === newConv.id)) {
          return prev;
        }
        return [newConv, ...prev];
      });
      setActiveConversation(newConv);
      setSidebarMode("chats");
      setSearch("");
    } catch (err) {
      console.error("createConversation failed! Status:", err.response?.status, "Payload data:", err.response?.data);
      console.warn("Failed to start backend conversation, falling back to local chat:", err);
      
      // Fallback: Create mock conversation locally if API failed (e.g. database mismatch or mock users)
      const curId = user?.id || user?._id;
      const tarId = selectedUser.id || selectedUser._id;
      const sortedIds = [curId, tarId].filter(Boolean).sort().join("_");
      const mockConvId = `mock_conv_shared_${sortedIds || Date.now()}`;

      const mockConv = {
        id: mockConvId,
        name: selectedUser.name,
        isGroup: false,
        participants: [
          selectedUser,
          { id: curId, name: user?.name || "Me", role: user?.role }
        ],
        unread: 0,
        lastSeen: "Just now",
        online: onlineUsers?.includes(selectedUser.id) || false,
        messages: []
      };

      // Save mock conversation to local storage cache so it persists on reload
      const localConvs = getLocalConvs() || [];
      if (!localConvs.some((c) => c.id === mockConv.id)) {
        saveLocalConvs([mockConv, ...localConvs]);
      }

      setConversations((prev) => {
        if (prev.some((c) => c.id === mockConv.id)) {
          return prev;
        }
        return [mockConv, ...prev];
      });
      setActiveConversation(mockConv);
      setSidebarMode("chats");
      setSearch("");
    }
  };

  const getRoleBadgeStyle = (role) => {
    const formatted = (role || "").toUpperCase();
    if (formatted.includes("INSTRUCTOR")) {
      return "bg-orange-500/10 text-orange-400 border border-orange-500/25";
    }
    if (formatted.includes("ADMIN")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
  };

  return (
    <div className="flex h-full flex-col">
      <ChatSearch
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto">
        {sidebarMode === "chats" ? (
          filteredConversations.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
              <p className="text-xs text-slate-500">No active conversations found</p>
              <button
                onClick={() => setSidebarMode("users")}
                className="mt-3 text-[11px] font-semibold text-orange-500 hover:underline"
              >
                Find users to message
              </button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ChatUserCard
                key={conversation.id}
                conversation={conversation}
                active={activeConversation?.id === conversation.id}
                onClick={() => setActiveConversation(conversation)}
              />
            ))
          )
        ) : loadingUsers ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-500">
            Searching directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-40 items-center justify-center p-6 text-center text-xs text-slate-500">
            No users matched "{search}"
          </div>
        ) : (
          filteredUsers.map((selectedUser) => {
            const isOnline = onlineUsers?.includes(selectedUser.id);
            return (
              <button
                key={selectedUser.id}
                onClick={() => handleStartChat(selectedUser)}
                className="
                  relative
                  w-full
                  flex
                  items-center
                  gap-3.5
                  px-4
                  py-3.5
                  text-left
                  transition-all
                  duration-300
                  border-b
                  border-slate-800/40
                  hover:bg-slate-800/20
                  border-l-[3px]
                  border-l-transparent
                  hover:border-l-orange-500/60
                "
              >
                <div className="relative flex-shrink-0">
                  <ChatAvatar name={selectedUser.name} image={selectedUser.avatar} />
                  <OnlineBadge online={isOnline} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-slate-100 truncate">
                    {selectedUser.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`
                      rounded-md
                      px-1.5
                      py-0.5
                      text-[9px]
                      font-bold
                      tracking-wide
                      ${getRoleBadgeStyle(selectedUser.role)}
                    `}>
                      {selectedUser.role || "STUDENT"}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {selectedUser.email}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}