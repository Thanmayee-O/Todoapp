import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { Text, TextInput, Button, ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function CreateTaskScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // — load token
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        navigation.replace("Home");
        return;
      }
      setToken(storedToken);
    };
    loadToken();
  }, []);

  // — fetch users after token
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const res = await API.get("/allusers", { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data || []);
      } catch (error) {
        console.log("FETCH USERS ERROR:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // — create task
  const handleCreate = async () => {
    if (!title || !description || !selectedUser) return;
    setSubmitting(true);
    try {
      await API.post("/tasks", { title, description, assignedTo: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } });
      navigation.goBack();
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setSubmitting(false);
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

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
        <Text style={styles.appbarTitle}>Create Task</Text>
        <View style={styles.appbarRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

          <Text style={styles.pickerLabel}>Assign to User</Text>
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
            onPress={handleCreate}
            loading={submitting}
            disabled={submitting || !title || !description || !selectedUser}
            style={styles.primaryBtn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
            icon="plus-circle-outline"
          >
            {submitting ? "Creating…" : "Create Task"}
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
    backgroundColor: COLORS.primary,
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