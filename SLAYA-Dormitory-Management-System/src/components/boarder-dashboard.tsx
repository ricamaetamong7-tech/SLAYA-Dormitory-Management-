import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase services
import { db, auth } from "../../services/firebase";

export default function BoarderDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [boarderName, setBoarderName] = useState("Boarder");
  const [roomNumber, setRoomNumber] = useState("Not Assigned");
  const [bedNumber, setBedNumber] = useState("");
  const [bedCapacity, setBedCapacity] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [balance, setBalance] = useState("₱ 0.00");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // FETCH BOARDER INFORMATION & DYNAMIC NAME
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Initial name from Auth profile or Email prefix
    let initialName = currentUser.displayName || "";
    if (!initialName && currentUser.email) {
      const emailPrefix = currentUser.email.split("@")[0];
      initialName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    if (initialName) setBoarderName(initialName);

    // 2. Fetch detailed record from Firestore
    const fetchUserData = async () => {
      try {
        // Priority A: Search by Document ID (UID)
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const retrievedName =
            data.username ||
            data.fullName ||
            data.name ||
            data.displayName;

          if (retrievedName) setBoarderName(retrievedName);
          setRoomNumber(
            String(data.room || data.roomNumber || data.roomAssigned || "Not Assigned")
          );
          setBedNumber(
            String(data.bedNumber || data.bedAssigned || data.bed || "")
          );
          setBedCapacity(
            String(data.bedCapacity || data.roomCapacity || data.capacity || data.totalBeds || "")
          );
        } else {
          // Priority B: Query by email if document ID is not UID
          const q = query(
            collection(db, "users"),
            where("email", "==", currentUser.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            const retrievedName =
              data.username ||
              data.fullName ||
              data.name ||
              data.displayName;

            if (retrievedName) setBoarderName(retrievedName);
            setRoomNumber(
              String(data.room || data.roomNumber || data.roomAssigned || "Not Assigned")
            );
            setBedNumber(
              String(data.bedNumber || data.bedAssigned || data.bed || "")
            );
            setBedCapacity(
              String(data.bedCapacity || data.roomCapacity || data.capacity || data.totalBeds || "")
            );
          }
        }
      } catch (error) {
        console.log("Error fetching user profile:", error);
      }
    };

    fetchUserData();

    // REAL-TIME PAYMENT BALANCE
    const paymentsQuery = query(
      collection(db, "payments"),
      where("email", "==", currentUser.email)
    );

    const unsubscribePayments = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        let totalUnpaid = 0;

        snapshot.forEach((paymentDoc) => {
          const data = paymentDoc.data();
          const status = data.status?.toLowerCase();

          if (status === "pending" || status === "unpaid") {
            totalUnpaid += Number(data.amount || 0);
          }
        });

        setBalance(
          "₱ " +
            totalUnpaid.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })
        );
      },
      (error) => {
        console.log("Payment error:", error);
      }
    );

    // REAL-TIME ANNOUNCEMENTS
    const updatesQuery = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeUpdates = onSnapshot(
      updatesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((announcementDoc) => ({
          id: announcementDoc.id,
          ...announcementDoc.data(),
        }));

        setAnnouncements(items);
        setLoading(false);
      },
      (error) => {
        console.log("Announcement error:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribePayments();
      unsubscribeUpdates();
    };
  }, []);

  // LOAD THE LOCALLY SAVED PROFILE PICTURE FOR THE CURRENT BOARDER
  // The same UID-based key is used by the Profile screen.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfilePicture = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          if (isActive) setProfileImage(null);
          return;
        }

        try {
          const savedImage = await AsyncStorage.getItem(
            `profileImage_${currentUser.uid}`
          );
          if (isActive) setProfileImage(savedImage);
        } catch (error) {
          console.log("Error loading profile picture:", error);
        }
      };

      loadProfilePicture();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // LOGOUT
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/");
          } catch (error) {
            Alert.alert("Error", "Unable to log out.");
          }
        },
      },
    ]);
  };

  // NAVIGATION
  const goTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/dashboard br.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.clayOverlay}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.topHeader}>
            <View style={styles.brand}>
              <View style={styles.logoIcon}>
                <Ionicons name="home" size={22} color="#173C68" />
              </View>

              <View>
                <Text style={styles.brandName}>SLAYA</Text>
                <Text style={styles.brandSubtitle}>
                  DORMITORY MANAGEMENT SYSTEM
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#173C68" />
            </TouchableOpacity>
          </View>

          {/* WELCOME CARD WITH DYNAMIC USERNAME */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeSmall}>BOARDER DASHBOARD</Text>
              <Text style={styles.welcomeHeader}>Hello, {boarderName}!</Text>
              <Text style={styles.welcomeSubtext}>
                Welcome back to your SLAYA account.
              </Text>

              <View style={styles.roleBadge}>
                <Ionicons name="school" size={13} color="#1674D1" />
                <Text style={styles.roleBadgeText}>Student / Boarder</Text>
              </View>
            </View>

            <View style={styles.welcomeIcon}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                  }}
                />
              ) : (
                <Ionicons name="person-circle" size={44} color="#173C68" />
              )}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              color="#315F91"
              size="large"
              style={{ margin: 35 }}
            />
          ) : (
            <>
              {/* MY INFORMATION */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Information</Text>
              </View>

              <View style={styles.grid}>
                <TouchableOpacity
                  style={styles.infoCard}
                  onPress={() => goTo("/room-assignment")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.cardIcon, { backgroundColor: "#D0E5FF" }]}>
                    <Ionicons name="bed" size={22} color="#173C68" />
                  </View>
                  <Text style={styles.cardTitle}>Room Assignment</Text>
                  <Text style={styles.cardValue}>{roomNumber}</Text>
                  <Text style={styles.cardHint}>
                    {bedNumber
                      ? `Bed ${bedNumber.replace(/^bed\s*/i, "")}${bedCapacity ? ` • ${bedCapacity} beds` : ""}`
                      : "View your room ›"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.infoCard}
                  onPress={() => goTo("/payments")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.cardIcon, { backgroundColor: "#D4EDDA" }]}>
                    <Ionicons name="wallet" size={22} color="#155724" />
                  </View>
                  <Text style={styles.cardTitle}>Payment Status</Text>
                  <Text style={styles.cardValue}>{balance}</Text>
                  <Text style={styles.cardHint}>Unpaid balance ›</Text>
                </TouchableOpacity>
              </View>

              {/* SERVICES */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dormitory Services</Text>
              </View>

              <TouchableOpacity
                style={styles.actionCardYellow}
                onPress={() => goTo("/file-complaint")}
                activeOpacity={0.85}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FFF3CD" }]}>
                    <Ionicons name="chatbox-ellipses" size={22} color="#856404" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>File a Complaint</Text>
                    <Text style={styles.actionSub}>Submit reports or concerns</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#856404" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCardBlue}
                onPress={() => goTo("/profile")}
                activeOpacity={0.85}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: "#D0E5FF" }]}>
                    <Ionicons name="person" size={22} color="#173C68" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>My Profile</Text>
                    <Text style={styles.actionSub}>View your personal information</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#173C68" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.policyCard}
                onPress={() => goTo("/policies")}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#F8D7DA" }]}>
                  <Ionicons name="document-text" size={22} color="#721C24" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Dorm Policies</Text>
                  <Text style={styles.actionSub}>Read rules and guidelines</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#721C24" />
              </TouchableOpacity>

              {/* RECENT UPDATES */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Updates</Text>
                <Ionicons name="notifications-outline" size={18} color="#173C68" />
              </View>

              <View style={styles.updateItem}>
                <View style={[styles.updateIcon, { backgroundColor: "#D0E5FF" }]}>
                  <Ionicons name="wallet" size={18} color="#173C68" />
                </View>
                <View style={styles.updateText}>
                  <Text style={styles.updateTitle}>Payment Reminder</Text>
                  <Text style={styles.updateDesc}>
                    Your next payment may be due soon.
                  </Text>
                </View>
              </View>

              {announcements.length === 0 ? (
                <View style={styles.updateItem}>
                  <View style={[styles.updateIcon, { backgroundColor: "#FFF3CD" }]}>
                    <Ionicons name="megaphone" size={18} color="#856404" />
                  </View>
                  <View style={styles.updateText}>
                    <Text style={styles.updateTitle}>System Announcement</Text>
                    <Text style={styles.updateDesc}>
                      Clean your designated area. Please be reminded.
                    </Text>
                  </View>
                </View>
              ) : (
                announcements.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.updateItem}>
                    <View style={[styles.updateIcon, { backgroundColor: "#FFF3CD" }]}>
                      <Ionicons name="notifications" size={18} color="#856404" />
                    </View>
                    <View style={styles.updateText}>
                      <Text style={styles.updateTitle}>
                        {item.title || "Announcement"}
                      </Text>
                      <Text style={styles.updateDesc}>
                        {item.message || item.description || ""}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/boarder-dashboard")}
          >
            <Ionicons name="home" size={22} color="#173C68" />
            <Text style={styles.activeNavText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/payments")}
          >
            <Ionicons name="wallet-outline" size={22} color="#75869B" />
            <Text style={styles.navText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/policies")}
          >
            <Ionicons name="document-text-outline" size={22} color="#75869B" />
            <Text style={styles.navText}>Policies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => goTo("/profile")}
          >
            <Ionicons name="person-outline" size={22} color="#75869B" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  clayOverlay: {
    flex: 1,
    backgroundColor: "rgba(220, 233, 247, 0.78)",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  topHeader: {
    height: 65,
    backgroundColor: "#E5EFFB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 3, height: 4 },
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#D9E6F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F8FBFF",
  },

  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#173C68",
    letterSpacing: 1.2,
  },

  brandSubtitle: {
    fontSize: 7.5,
    fontWeight: "800",
    color: "#557392",
  },

  logoutButton: {
    width: 38,
    height: 38,
    backgroundColor: "#D9E6F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F8FBFF",
  },

  welcomeCard: {
    backgroundColor: "#E5EFFB",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    flexDirection: "row",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 5 },
  },

  welcomeTextContainer: {
    flex: 1,
  },

  welcomeSmall: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#557392",
    marginBottom: 5,
  },

  welcomeHeader: {
    fontSize: 22,
    fontWeight: "900",
    color: "#173C68",
  },

  welcomeSubtext: {
    fontSize: 11,
    color: "#75869B",
    marginTop: 3,
  },

  welcomeIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#D9E6F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#F8FBFF",
    elevation: 3,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D0E5FF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
    gap: 5,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1674D1",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",  
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
    marginLeft: 2,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#173C68",
  },

  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 14,
    minHeight: 145,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 6,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 3, height: 4 },
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#557392",
    marginTop: 10,
  },

  cardValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#173C68",
    marginTop: 4,
  },

  cardHint: {
    fontSize: 9,
    fontWeight: "700",
    color: "#75869B",
    marginTop: 4,
  },

  actionCardYellow: {
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 3, height: 4 },
  },

  actionCardBlue: {
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 3, height: 4 },
  },

  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#173C68",
  },

  actionSub: {
    fontSize: 9,
    color: "#75869B",
    marginTop: 2,
  },

  policyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5EFFB",
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 3, height: 4 },
  },

  updateItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5EFFB",
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 4,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  updateIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  updateText: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#173C68",
  },

  updateDesc: {
    fontSize: 9,
    color: "#75869B",
    marginTop: 2,
  },

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

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navText: {
    fontSize: 9,
    color: "#75869B",
    marginTop: 3,
  },

  activeNavText: {
    fontSize: 9,
    color: "#173C68",
    fontWeight: "900",
    marginTop: 3,
  },
});