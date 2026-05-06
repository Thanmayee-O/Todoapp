import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function EditTaskScreen({ route, navigation }) {
  const { task } = route.params;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [selectedUser, setSelectedUser] = useState(task.assignedTo?._id || task.assignedTo);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // — load token + users
  useEffect(() => {
    const loadTokenAndUsers = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) { navigation.replace("Home"); return; }
      setToken(storedToken);
      try {
        const res = await API.get("/allusers", { headers: { Authorization: `Bearer ${storedToken}` } });
        setUsers(res.data || []);
      } catch (_error) {
        // silent fail — existing users still shown from task data
      } finally {
        setLoading(false);
      }
    };
    loadTokenAndUsers();
  }, []);

  //— update task
  const handleUpdate = async () => {
    if (!title || !description || !selectedUser) return;
    setUpdating(true);
    try {
      await API.put(
        `/tasks/${task._id}`,
        { title, description, assignedTo: selectedUser, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.goBack();
    } catch (_error) {
      // keep existing error handling silent
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Appbar */}
      <View style={styles.appbar}>
        <Button
          icon="arrow-left"
          textColor="#fff"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          Back
        </Button>
        <Text style={styles.appbarTitle}>Edit Task</Text>
        <View style={styles.appbarRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current status banner */}
        <View style={[
          styles.statusBanner,
          status === "completed" ? styles.bannerDone : styles.bannerPending
        ]}>
          <Text style={[
            styles.statusBannerText,
            { color: status === "completed" ? COLORS.completed : COLORS.pending }
          ]}>
            {status === "completed" ? "✅ Currently Completed" : "⏳ Currently Pending"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Task Details</Text>

          <TextInput
            label="Task Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            left={<TextInput.Icon icon="format-title" />}
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            left={<TextInput.Icon icon="text-box-outline" />}
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />

          <Text style={styles.pickerLabel}>Status</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={status}
              onValueChange={(val) => setStatus(val)}
              style={{ color: COLORS.textPrimary }}
            >
              <Picker.Item label="⏳  Pending" value="pending" />
              <Picker.Item label="✅  Completed" value="completed" />
            </Picker>
          </View>

          <Text style={styles.pickerLabel}>Assigned to</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedUser}
              onValueChange={(val) => setSelectedUser(val)}
              style={{ color: COLORS.textPrimary }}
            >
              <Picker.Item label="— Select a user —" value="" />
              {users.map((u) => (
                <Picker.Item key={u._id} label={u.email} value={u._id} />
              ))}
            </Picker>
          </View>

          <Button
            mode="contained"
            onPress={handleUpdate}
            loading={updating}
            disabled={updating}
            style={styles.primaryBtn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
            icon="content-save-outline"
          >
            {updating ? "Saving…" : "Save Changes"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
            contentStyle={styles.btnContent}
            labelStyle={[styles.btnLabel, { color: COLORS.textSecondary }]}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  appbar: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: SPACING.xl + 4,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { marginLeft: -SPACING.xs },
  appbarTitle: { fontSize: 18, fontWeight: FONT.bold, color: "#fff" },
  appbarRight: { width: 80 },

  statusBanner: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  bannerDone: { backgroundColor: COLORS.completedBg },
  bannerPending: { backgroundColor: COLORS.pendingBg },
  statusBannerText: { fontSize: 13, fontWeight: FONT.semiBold },

  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  input: { marginBottom: SPACING.md, backgroundColor: COLORS.surface },
  pickerLabel: {
    fontSize: 14, fontWeight: FONT.medium, color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  pickerWrap: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface, marginBottom: SPACING.lg, overflow: "hidden",
  },
  primaryBtn: { borderRadius: RADIUS.md, backgroundColor: COLORS.primary, marginBottom: SPACING.sm },
  cancelBtn: { borderRadius: RADIUS.md, borderColor: COLORS.border },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 15, fontWeight: FONT.semiBold },
});
