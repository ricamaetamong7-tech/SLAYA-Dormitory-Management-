import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../services/firebase";

export default function CaretakerDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalPaidMonth, setTotalPaidMonth] = useState("₱ 36,750.00");
  const [unpaidBoardersCount, setUnpaidBoardersCount] = useState(5);
  const [recentComplaintsCount, setRecentComplaintsCount] = useState(3);
  const [unpaidList, setUnpaidList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);

  useEffect(() => {
    // 1. Listen for Payments
    const paymentsQuery = query(collection(db, "payments"));
    const unsubscribePayments = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        let totalPaidSum = 0;
        const unpaidItems: any[] = [];

        snapshot.forEach((docDoc) => {
          const data = docDoc.data();
          if (data.status?.toLowerCase() === "paid") {
            totalPaidSum += Number(data.amount || 0);
          } else if (
            data.status?.toLowerCase() === "unpaid" ||
            data.status?.toLowerCase() === "pending"
          ) {
            unpaidItems.push({
              id: docDoc.id,
              name: data.userName || data.boarderName || "Student",
              room: data.roomInfo || "Room 05 - Bed 1",
              amount: data.amount ? `₱ ${Number(data.amount).toLocaleString()}` : "₱ 1,500.00",
              dueDate: data.dueDate || "Oct 15, 2026",
            });
          }
        });

        if (totalPaidSum > 0) {
          setTotalPaidMonth(
            "₱ " + totalPaidSum.toLocaleString("en-PH", { minimumFractionDigits: 2 })
          );
        }
        if (unpaidItems.length > 0) {
          setUnpaidList(unpaidItems);
          setUnpaidBoardersCount(unpaidItems.length);
        } else {
          setUnpaidList([
            { id: "1", name: "Juan Dela Cruz", room: "Room 05 - Bed 1", amount: "₱ 1,500.00", dueDate: "Sep 30, 2026" },
            { id: "2", name: "Ana Santos", room: "Room 08 - Bed 2", amount: "₱ 1,500.00", dueDate: "Sep 30, 2026" },
            { id: "3", name: "Rico Reyes", room: "Room 10 - Bed 1", amount: "₱ 1,500.00", dueDate: "Oct 05, 2026" },
            { id: "4", name: "Ella Garcia", room: "Room 12 - Bed 2", amount: "₱ 1,500.00", dueDate: "Oct 07, 2026" },
            { id: "5", name: "Mark Lopez", room: "Room 15 - Bed 1", amount: "₱ 1,500.00", dueDate: "Oct 10, 2026" },
          ]);
        }
      },
      (error) => console.log("Payments error:", error)
    );

    // 2. Listen for Complaints
    const complaintsQuery = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribeComplaints = onSnapshot(
      complaintsQuery,
      (snapshot) => {
        const complaints: any[] = [];
        snapshot.forEach((docDoc) => {
          const data = docDoc.data();
          complaints.push({
            id: docDoc.id,
            name: data.boarderName || data.userName || "Boarder",
            issue: data.issue || data.description || "General Complaint",
            date: data.date || "Sep 28, 2026",
            status: data.status || "In Progress",
          });
        });

        if (complaints.length > 0) {
          setComplaintsList(complaints);
          setRecentComplaintsCount(complaints.length);
        } else {
          setComplaintsList([
            { id: "1", name: "Maria Santos", issue: "Leaking faucet (Room 08)", date: "Sep 28, 2026", status: "In Progress" },
            { id: "2", name: "Juan Dela Cruz", issue: "No electricity (Room 12)", date: "Sep 27, 2026", status: "Done" },
            { id: "3", name: "Rico Reyes", issue: "Noise complaint (Room 10)", date: "Sep 24, 2026", status: "Pending" },
          ]);
        }
        setLoading(false);
      },
      (error) => {
        console.log("Complaints error:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribePayments();
      unsubscribeComplaints();
    };
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
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
    ]);
  };

  const goTo = (path: string) => {
    router.push(path as any);
  };

  const renderBadge = (status: string) => {
    let bgColor = "#D0E5FF";
    let textColor = "#124C80";

    const s = status.toLowerCase();
    if (s === "done" || s === "resolved") {
      bgColor = "#D4EDDA";
      textColor = "#155724";
    } else if (s === "pending") {
      bgColor = "#FFF3CD";
      textColor = "#856404";
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.brand}>
          <Ionicons name="home" size={24} color="#173C68" />
          <View>
            <Text style={styles.brandName}>SLAYA</Text>
            <Text style={styles.brandSubtitle}>DORMITORY MANAGEMENT</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#173C68" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* WELCOME CLAY CARD */}
        <View style={styles.welcomeBanner}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={34} color="#173C68" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.welcomeTitle}>Welcome, Sir/Ma'am!</Text>
            <Text style={styles.welcomeSub}>Here's what's happening in the dormitory today.</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#315F91" style={{ margin: 30 }} />
        ) : (
          <>
            {/* 3 TOP SUMMARY CARDS */}
            <View style={styles.summaryRow}>
              {/* Total Paid */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.miniIcon, { backgroundColor: "#D4EDDA" }]}>
                    <Ionicons name="wallet" size={14} color="#155724" />
                  </View>
                  <Text style={styles.cardTitle}>Total Paid</Text>
                </View>
                <Text style={styles.subNote}>This Month</Text>
                <Text style={styles.greenValue}>{totalPaidMonth}</Text>
              </View>

              {/* Boarders Not Paid */}
              <TouchableOpacity style={styles.summaryCard} onPress={() => goTo("/unpaid-boarders")}>
                <View style={styles.cardHeader}>
                  <View style={[styles.miniIcon, { backgroundColor: "#F8D7DA" }]}>
                    <Ionicons name="alert-circle" size={14} color="#721C24" />
                  </View>
                  <Text style={styles.cardTitle}>Not Paid</Text>
                </View>
                <Text style={styles.redValue}>{unpaidBoardersCount}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.redFooterText}>View List ›</Text>
                </View>
              </TouchableOpacity>

              {/* Recent Complaints */}
              <TouchableOpacity style={styles.summaryCard} onPress={() => goTo("/complaints")}>
                <View style={styles.cardHeader}>
                  <View style={[styles.miniIcon, { backgroundColor: "#D1ECF1" }]}>
                    <Ionicons name="chatbox" size={14} color="#0C5460" />
                  </View>
                  <Text style={styles.cardTitle}>Complaints</Text>
                </View>
                <Text style={styles.blueValue}>{recentComplaintsCount}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.blueFooterText}>View All ›</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* QUICK ACTIONS */}
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => goTo("/add-boarder")}>
                <View style={[styles.actionIcon, { backgroundColor: "#D0E5FF" }]}>
                  <Ionicons name="person-add" size={18} color="#173C68" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionBtnTitle}>Add Boarder</Text>
                  <Text style={styles.actionBtnSub}>Register student</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#557392" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => goTo("/update-payment")}>
                <View style={[styles.actionIcon, { backgroundColor: "#D4EDDA" }]}>
                  <Ionicons name="card" size={18} color="#155724" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionBtnTitle}>Update Payment</Text>
                  <Text style={styles.actionBtnSub}>Mark paid/unpaid</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#557392" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => goTo("/manage-complaints")}>
                <View style={[styles.actionIcon, { backgroundColor: "#FFF3CD" }]}>
                  <Ionicons name="list" size={18} color="#856404" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionBtnTitle}>Complaints</Text>
                  <Text style={styles.actionBtnSub}>Update status</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#557392" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => goTo("/view-records")}>
                <View style={[styles.actionIcon, { backgroundColor: "#FFE8D6" }]}>
                  <Ionicons name="calendar" size={18} color="#A75D00" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionBtnTitle}>View Records</Text>
                  <Text style={styles.actionBtnSub}>Reports & logs</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#557392" />
              </TouchableOpacity>
            </View>

            {/* BOARDERS NOT PAID LIST */}
            <View style={styles.clayCard}>
              <View style={styles.listHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="alert-circle" size={20} color="#C92A2A" />
                  <Text style={styles.listHeaderTitle}>Boarders Not Paid</Text>
                </View>
                <TouchableOpacity onPress={() => goTo("/unpaid-boarders")}>
                  <Text style={styles.viewAllText}>View All ›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.tableColLeft}>Name / Room</Text>
                <Text style={styles.tableColRight}>Amount Due / Date</Text>
              </View>

              {unpaidList.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color="#315F91" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.room}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.rowAmount}>{item.amount}</Text>
                    <Text style={styles.rowDate}>{item.dueDate}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* RECENT COMPLAINTS LIST */}
            <View style={styles.clayCard}>
              <View style={styles.listHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="chatbox-ellipses" size={20} color="#1864AB" />
                  <Text style={styles.listHeaderTitle}>Recent Complaints</Text>
                </View>
              </View>

              {complaintsList.map((item) => (
                <View key={item.id} style={styles.complaintRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.complaintName}>{item.name}</Text>
                    <Text style={styles.complaintIssue}>{item.issue}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.complaintDate}>{item.date}</Text>
                    {renderBadge(item.status)}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* BOTTOM CLAY NAV BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => goTo("/caretaker-dashboard")}>
          <Ionicons name="home" size={22} color="#173C68" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => goTo("/boarders-list")}>
          <Ionicons name="people-outline" size={22} color="#75869B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => goTo("/manage-complaints")}>
          <Ionicons name="document-text-outline" size={22} color="#75869B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => goTo("/payments-management")}>
          <Ionicons name="card-outline" size={22} color="#75869B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => goTo("/profile")}>
          <Ionicons name="person-outline" size={22} color="#75869B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCE9F7" },
  topHeader: {
    height: 65,
    backgroundColor: "#E5EFFB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: "#F7FBFF",
    elevation: 4,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandName: { fontSize: 18, fontWeight: "900", color: "#173C68", letterSpacing: 1 },
  brandSubtitle: { fontSize: 8, fontWeight: "800", color: "#557392" },
  logoutButton: {
    padding: 8,
    backgroundColor: "#D9E6F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F8FBFF",
    elevation: 2,
  },
  scrollContent: { padding: 16, paddingBottom: 35 },
  welcomeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5EFFB",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 6,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 5 },
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#D9E6F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F8FBFF",
    elevation: 3,
  },
  welcomeTitle: { fontSize: 16, fontWeight: "900", color: "#173C68" },
  welcomeSub: { fontSize: 10, color: "#75869B", marginTop: 3 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 6,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 3, height: 4 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniIcon: { width: 22, height: 22, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 10, fontWeight: "800", color: "#173C68" },
  subNote: { fontSize: 8, color: "#75869B", marginTop: 4 },
  greenValue: { fontSize: 12, fontWeight: "900", color: "#155724", marginTop: 4 },
  redValue: { fontSize: 20, fontWeight: "900", color: "#C92A2A", marginTop: 4 },
  blueValue: { fontSize: 20, fontWeight: "900", color: "#1864AB", marginTop: 4 },
  cardFooter: { marginTop: 4 },
  redFooterText: { fontSize: 9, fontWeight: "800", color: "#C92A2A" },
  blueFooterText: { fontSize: 9, fontWeight: "800", color: "#1864AB" },
  sectionHeader: { fontSize: 14, fontWeight: "900", color: "#173C68", marginBottom: 12, marginLeft: 4 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  actionBtn: {
    width: "48%",
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 3, height: 4 },
  },
  actionIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  actionBtnTitle: { fontSize: 11, fontWeight: "900", color: "#173C68" },
  actionBtnSub: { fontSize: 8, color: "#75869B", marginTop: 1 },
  clayCard: {
    backgroundColor: "#E5EFFB",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 6,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 5 },
  },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  listHeaderTitle: { fontSize: 14, fontWeight: "900", color: "#173C68" },
  viewAllText: { fontSize: 11, fontWeight: "800", color: "#245F9B" },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#D9E6F5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D0DFF0",
  },
  tableColLeft: { fontSize: 9, fontWeight: "800", color: "#557392" },
  tableColRight: { fontSize: 9, fontWeight: "800", color: "#557392" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE9F7",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#D9E6F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F8FBFF",
  },
  rowName: { fontSize: 11, fontWeight: "900", color: "#173C68" },
  rowSub: { fontSize: 9, color: "#75869B" },
  rowAmount: { fontSize: 11, fontWeight: "900", color: "#173C68" },
  rowDate: { fontSize: 8, color: "#75869B" },
  complaintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE9F7",
  },
  complaintName: { fontSize: 11, fontWeight: "900", color: "#173C68" },
  complaintIssue: { fontSize: 10, color: "#75869B", marginTop: 2 },
  complaintDate: { fontSize: 8, color: "#75869B", marginBottom: 4 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900" },
  bottomNav: {
    height: 65,
    backgroundColor: "#E5EFFB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 10,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1, paddingVertical: 10 },
});