
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../services/firebase";

type UserData = {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
};

type PaymentData = {
  id: string;
  amount?: number;
  status?: string;
  boarderName?: string;
  fullName?: string;
  room?: string;
  dueDate?: any;
};

type IssueData = {
  id: string;
  status?: string;
};

type ActivityData = {
  id: string;
  title?: string;
  description?: string;
  time?: string;
  createdAt?: any;
};

export default function OwnerDashboard() {
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loaded = 0;
    const totalCollections = 4;

    const finishLoading = () => {
      loaded += 1;
      if (loaded >= totalCollections) {
        setLoading(false);
      }
    };

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserData[]
        );
        finishLoading();
      },
      (error) => {
        console.log("Users error:", error.message);
        finishLoading();
      }
    );

    const unsubscribePayments = onSnapshot(
      collection(db, "payments"),
      (snapshot) => {
        setPayments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PaymentData[]
        );
        finishLoading();
      },
      (error) => {
        console.log("Payments error:", error.message);
        finishLoading();
      }
    );

    const unsubscribeIssues = onSnapshot(
      collection(db, "issues"),
      (snapshot) => {
        setIssues(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as IssueData[]
        );
        finishLoading();
      },
      (error) => {
        console.log("Issues error:", error.message);
        finishLoading();
      }
    );

    const unsubscribeActivities = onSnapshot(
      collection(db, "activities"),
      (snapshot) => {
        setActivities(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ActivityData[]
        );
        finishLoading();
      },
      (error) => {
        console.log("Activities error:", error.message);
        finishLoading();
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribePayments();
      unsubscribeIssues();
      unsubscribeActivities();
    };
  }, []);

  // DASHBOARD COUNTS
  const totalUsers = users.length;

  const totalBoarders = users.filter(
    (user) => user.role?.toLowerCase() === "boarder"
  ).length;

  const totalPayments = payments
    .filter(
      (payment) => payment.status?.toLowerCase() === "paid"
    )
    .reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

  const pendingPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "pending"
  );

  const pendingIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() === "pending"
  ).length;

  const formatMoney = (amount: number) =>
    "₱ " + amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value: any) => {
    if (!value) return "Date not set";

    const date = value?.toDate
      ? value.toDate()
      : new Date(value);

    if (isNaN(date.getTime())) return "Date not set";

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (activity: ActivityData) => {
    if (activity.time) return activity.time;

    if (activity.createdAt) {
      const date = activity.createdAt?.toDate
        ? activity.createdAt.toDate()
        : new Date(activity.createdAt);

      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return "";
  };

  // NAVIGATION
  const goTo = (path: string) => {
    router.push(path as any);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/");
            } catch {
              Alert.alert("Error", "Unable to log out.");
            }
          },
        },
      ]
    );
  };

  // OVERVIEW CARD
  const OverviewCard = ({
    icon,
    label,
    value,
    note,
    color,
    background,
  }: {
    icon: any;
    label: string;
    value: string;
    note: string;
    color: string;
    background: string;
  }) => (
    <View style={[styles.overviewCard, { backgroundColor: background }]}>
      <View style={[styles.overviewIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={21} color="#FFFFFF" />
      </View>

      <View style={styles.overviewInfo}>
        <Text style={styles.overviewValue}>{value}</Text>
        <Text style={styles.overviewLabel}>{label}</Text>
        <Text style={styles.overviewNote}>{note}</Text>
      </View>
    </View>
  );

  // MANAGEMENT TOOL
  const ManagementTool = ({
    icon,
    title,
    description,
    color,
    onPress,
  }: {
    icon: any;
    title: string;
    description: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.toolCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.toolIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>

      <View style={styles.toolText}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolDescription}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={17} color="#6D91B5" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../assets/images/dashboard br.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* TOP HEADER */}
        <View style={styles.topHeader}>
          <View style={styles.brand}>
            <Ionicons name="home" size={34} color="#FFFFFF" />

            <View>
              <Text style={styles.brandName}>SLAYA</Text>
              <Text style={styles.brandSubtitle}>
                Dormitory Management System
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* WELCOME CARD */}
          <View style={styles.welcomeCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color="#FFFFFF" />
            </View>

            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Good Morning, Admin!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Here's an overview of the system.
              </Text>

              <View style={styles.ownerBadge}>
                <Ionicons name="settings-outline" size={12} color="#1674D1" />
                <Text style={styles.ownerBadgeText}>
                  Dormitory Owner
                </Text>
              </View>
            </View>
          </View>

          {/* DORM OVERVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dorm Overview</Text>

            <View style={styles.overviewGrid}>
              <OverviewCard
                icon="people"
                label="Total Users"
                value={String(totalUsers)}
                note="Active accounts"
                color="#1685E5"
                background="#E5F2FF"
              />

              <OverviewCard
                icon="home"
                label="Total Boarders"
                value={String(totalBoarders)}
                note="In the dormitory"
                color="#0DAB82"
                background="#E4F8F2"
              />

              <OverviewCard
                icon="card"
                label="Total Payments"
                value={formatMoney(totalPayments)}
                note="Collected payments"
                color="#8051D8"
                background="#F0E9FF"
              />

              <OverviewCard
                icon="warning"
                label="Pending Issues"
                value={String(pendingIssues)}
                note="Require attention"
                color="#FF9900"
                background="#FFF2DD"
              />
            </View>
          </View>

          {/* MANAGEMENT TOOLS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management Tools</Text>

            <View style={styles.toolsGrid}>
              <ManagementTool
                icon="people-outline"
                title="Account Management"
                description="Manage user accounts and profiles."
                color="#1685E5"
                onPress={() => goTo("/accounts")}
              />

              <ManagementTool
                icon="shield-checkmark-outline"
                title="User Roles & Permissions"
                description="Set roles and access rights."
                color="#0DAB82"
                onPress={() => goTo("/user-roles")}
              />

              <ManagementTool
                icon="server-outline"
                title="System Records"
                description="View logs and backup data."
                color="#8051D8"
                onPress={() => goTo("/records")}
              />
            </View>
          </View>

          {/* PENDING DUES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Dues</Text>

              <TouchableOpacity onPress={() => goTo("/payments")}>
                <Text style={styles.viewAll}>
                  View All <Ionicons name="chevron-forward" size={13} />
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#1674D1" style={{ margin: 20 }} />
            ) : pendingPayments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={30}
                  color="#0DAB82"
                />
                <Text style={styles.emptyText}>
                  No pending payments.
                </Text>
              </View>
            ) : (
              pendingPayments.slice(0, 5).map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={styles.dueCard}
                  onPress={() => goTo("/payments")}
                >
                  <View style={styles.dueAvatar}>
                    <Ionicons
                      name="person"
                      size={19}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.dueDetails}>
                    <Text style={styles.dueName}>
                      {payment.boarderName ||
                        payment.fullName ||
                        "Boarder"}
                    </Text>

                    <Text style={styles.dueRoom}>
                      {payment.room || "Room not specified"}
                    </Text>

                    <Text style={styles.dueDate}>
                      Due: {formatDate(payment.dueDate)}
                    </Text>
                  </View>

                  <View style={styles.dueRight}>
                    <Text style={styles.dueAmount}>
                      {formatMoney(Number(payment.amount || 0))}
                    </Text>

                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* RECENT ACTIVITY */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              <TouchableOpacity onPress={() => goTo("/records")}>
                <Text style={styles.viewAll}>
                  View All <Ionicons name="chevron-forward" size={13} />
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#1674D1" style={{ margin: 20 }} />
            ) : activities.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="time-outline"
                  size={28}
                  color="#6B91BA"
                />
                <Text style={styles.emptyText}>
                  No recent activity found.
                </Text>
              </View>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name="notifications-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>
                      {activity.title || "System Activity"}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {activity.description || ""}
                    </Text>
                  </View>

                  <Text style={styles.activityTime}>
                    {formatTime(activity)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.footer}>
            © SLAYA Dormitory Management System
          </Text>
        </ScrollView>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/owner-dashboard")}
          >
            <Ionicons name="home-outline" size={21} color="#1685E5" />
            <Text style={styles.activeNavText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/accounts")}
          >
            <Ionicons name="people-outline" size={21} color="#8A9DB3" />
            <Text style={styles.navText}>Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/records")}
          >
            <Ionicons name="document-text-outline" size={21} color="#8A9DB3" />
            <Text style={styles.navText}>Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/settings")}
          >
            <Ionicons name="settings-outline" size={21} color="#8A9DB3" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(221, 237, 252, 0.50)",
  },

  // HEADER
  topHeader: {
    height: 66,
    backgroundColor: "#245B91",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 3,
    borderBottomColor: "#9BC9EF",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  brandName: {
    fontSize: 23,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  brandSubtitle: {
    fontSize: 9,
    color: "#E1F0FF",
  },

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#477DAE",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 20,
  },

  // WELCOME
  welcomeCard: {
    backgroundColor: "#D9EDFF",
    borderRadius: 22,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    elevation: 7,
    shadowColor: "#527DA6",
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: { width: 4, height: 5 },
    marginBottom: 15,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: "#4388C2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  welcomeText: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#174C7D",
  },

  welcomeSubtitle: {
    fontSize: 11,
    color: "#6484A4",
    marginTop: 3,
  },

  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  ownerBadgeText: {
    color: "#1674D1",
    fontSize: 10,
    fontWeight: "800",
  },

  // SECTIONS
  section: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#174C7D",
    marginBottom: 9,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewAll: {
    fontSize: 10,
    color: "#1674D1",
    fontWeight: "700",
    marginBottom: 9,
  },

  // OVERVIEW
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  overviewCard: {
    width: "48.5%",
    flexGrow: 1,
    minHeight: 82,
    borderRadius: 19,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 5,
    shadowColor: "#6C8FAF",
    shadowOpacity: 0.17,
    shadowRadius: 6,
    shadowOffset: { width: 3, height: 4 },
  },

  overviewIcon: {
    width: 35,
    height: 35,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  overviewInfo: {
    flex: 1,
  },

  overviewValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#174C7D",
  },

  overviewLabel: {
    fontSize: 10,
    color: "#315C83",
    fontWeight: "700",
  },

  overviewNote: {
    fontSize: 8,
    color: "#7891A9",
    marginTop: 2,
  },

  // MANAGEMENT
  toolsGrid: {
    gap: 9,
  },

  toolCard: {
    minHeight: 66,
    backgroundColor: "#E7F2FD",
    borderRadius: 17,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#6487A9",
    shadowOpacity: 0.17,
    shadowRadius: 5,
    shadowOffset: { width: 3, height: 4 },
  },

  toolIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  toolText: {
    flex: 1,
  },

  toolTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#174C7D",
  },

  toolDescription: {
    fontSize: 9,
    color: "#7891A9",
    marginTop: 3,
  },

  // PENDING DUES
  dueCard: {
    backgroundColor: "#E8F3FD",
    borderRadius: 17,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#6889A8",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 3 },
  },

  dueAvatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#4F92C9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  dueDetails: {
    flex: 1,
  },

  dueName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#174C7D",
  },

  dueRoom: {
    fontSize: 9,
    color: "#6385A6",
    marginTop: 2,
  },

  dueDate: {
    fontSize: 9,
    color: "#6385A6",
    marginTop: 2,
  },

  dueRight: {
    alignItems: "flex-end",
    gap: 5,
  },

  dueAmount: {
    fontSize: 11,
    fontWeight: "900",
    color: "#174C7D",
  },

  pendingBadge: {
    backgroundColor: "#FFF0D5",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },

  pendingText: {
    color: "#E58B14",
    fontSize: 9,
    fontWeight: "800",
  },

  // ACTIVITY
  activityCard: {
    backgroundColor: "#E8F3FD",
    borderRadius: 15,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#6889A8",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 3 },
  },

  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: "#1685E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  activityDetails: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 10,
    color: "#174C7D",
    fontWeight: "900",
  },

  activityDescription: {
    fontSize: 8,
    color: "#7891A9",
    marginTop: 2,
  },

  activityTime: {
    fontSize: 8,
    color: "#6F91B4",
  },

  emptyCard: {
    backgroundColor: "#E8F3FD",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 3,
  },

  emptyText: {
    fontSize: 11,
    color: "#6685A3",
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 8,
    marginBottom: 10,
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    height: 65,
    backgroundColor: "#F4F9FF",
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 12,
    shadowColor: "#315F91",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    flex: 1,
  },

  navText: {
    fontSize: 9,
    color: "#8A9DB3",
  },

  activeNavText: {
    fontSize: 9,
    color: "#1685E5",
    fontWeight: "900",
  },
});
