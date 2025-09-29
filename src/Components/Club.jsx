
import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ClubsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const token = useSelector((state) => state.auth.user.token);
  const [modal, setModal] = useState({
    show: false,
    type: "",
    club: null,
    tokens: "",
    form: { name: "", category: "", leader: "", login: "", password: "" }
  });

  const fetchClubs = async () => {
    try {
      const res = await fetch("https://api.univibe.uz/api/v1/clubs/list-staff/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  // const fetchClubsList = async () => {
  //   try {
  //     const res = await fetch("https://api.univibe.uz/api/v1/clubs/list/", {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     const data = await res.json();
  //     setClubsList(Array.isArray(data) ? data : []);
  //   } catch (err) {
  //     toast.error("Failed to load clubs");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://api.univibe.uz/api/v1/clubs/category/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://api.univibe.uz/api/v1/students/list/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchCategories();
    fetchUsers();
  }, []);

  const handleAddClub = async () => {
    try {
      const res = await fetch("https://api.univibe.uz/api/v1/clubs/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(modal.form)
      });

      if (res.ok) {
        toast.success("Club added!");
        fetchClubs();
        setModal({ ...modal, show: false });
      } else {
        toast.error(await res.text());
      }
    } catch (err) {
      toast.error("Failed to add club");
    }
  };

  const handleEditClub = async () => {
    try {
      const payload = {
        ...modal.form,
        category: parseInt(modal.form.category), 
        leader: parseInt(modal.form.leader) 
      };
      if (!payload.category || isNaN(payload.category)) {
        toast.error("Please select a category");
        return;
      }
      if (!payload.leader || isNaN(payload.leader)) {
        toast.error("Please select a leader");
        return;
      }
      const res = await fetch(`https://api.univibe.uz/api/v1/clubs/edit/${modal.club.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Edited ${modal.form.name} club!`);
        fetchClubs();
        setModal({ ...modal, show: false });
      } else {
        toast.error(await res.text());
      }
    } catch (err) {
      toast.error("Failed to edit club");
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Delete this club?")) return;

    try {
      const res = await fetch(`https://api.univibe.uz/api/v1/clubs/edit/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 204) {
        toast.success("Club deleted!");
        fetchClubs();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleAddTokens = async () => {
    try {
      const res = await fetch(`https://api.univibe.uz/api/v1/clubs/${modal.club.id}/add_tokens/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: modal.tokens })
      });

      if (res.ok) {
        toast.success(`Added ${modal.tokens} tokens!`);
        setModal({ ...modal, show: false });
      } else {
        toast.error(await res.text());
      }
    } catch (err) {
      toast.error("Failed to add tokens");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 bg-base-100 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clubs Management</h1>
        <button
          className="btn btn-primary btn-sm text-base-100"
          onClick={() => setModal({
            show: true,
            type: "add",
            club: null,
            tokens: "",
            form: { name: "", category: "", leader: "", login: "", password: "" }
          })}
        >
          <FiPlus /> Add Club
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Leader</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map(club => (
              <tr key={club.id}>
                <td>{club.name}</td>
                <td>{club.category}</td>
                <td>{club.leader}</td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm text-primary"
                    onClick={() => setModal({
                      show: true,
                      type: "tokens",
                      club,
                      tokens: "",
                      form: { ...modal.form }
                    })}
                  >
                    <FiDollarSign /> Add Tokens
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-primary"
                    onClick={() => {
                      const selectedCategory = categories.find(cat => cat.name === club.category);
                      const selectedLeader = users.find(user => user.name === club.leader || user.username === club.leader);
                      if (!selectedCategory) {
                        toast.error(`Category "${club.category}" not found`);
                        return;
                      }
                      if (!selectedLeader) {
                        toast.error(`Leader "${club.leader}" not found`);
                        return;
                      }
                      setModal({
                        show: true,
                        type: "edit",
                        club,
                        tokens: "",
                        form: {
                          name: club.name,
                          category: selectedCategory.id,
                          leader: selectedLeader.id,
                          login: club.login,
                          password: club.password || ""
                        }
                      });
                    }}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDeleteClub(club.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Club Modal */}
      {modal.show && (modal.type === "add" || modal.type === "edit") && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{modal.type === "add" ? "Add New Club" : "Edit Club"}</h3>
            <div className="space-y-4 py-4">
              <input
                type="text"
                placeholder="Club Name"
                className="input input-bordered w-full"
                value={modal.form.name}
                onChange={(e) => setModal({
                  ...modal,
                  form: { ...modal.form, name: e.target.value }
                })}
              />
              <select
                className="select select-bordered w-full focus:shadow-2xl"
                // value={modal.form.category}
                onChange={(e) => setModal({
                  ...modal,
                  form: { ...modal.form, category: e.target.value }
                })}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered w-full"
                // value={modal.form.leader}
                onChange={(e) => setModal({
                  ...modal,
                  form: { ...modal.form, leader: e.target.value }
                })}
              >
                <option value="" disabled>Select Leader</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Login"
                className="input input-bordered w-full"
                // value={modal.form.login}
                onChange={(e) => setModal({
                  ...modal,
                  form: { ...modal.form, login: e.target.value }
                })}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input input-bordered w-full pr-10"
                  // value={modal.form.password}
                  onChange={(e) => setModal({
                    ...modal,
                    form: { ...modal.form, password: e.target.value }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setModal({ ...modal, show: false })}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={modal.type === "add" ? handleAddClub : handleEditClub}
              >
                {modal.type === "add" ? "Add Club" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tokens Modal */}
      {modal.show && modal.type === "tokens" && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Tokens to {modal.club.name}</h3>
            <div className="py-4">
              <input
                type="number"
                placeholder="Amount"
                className="input input-bordered w-full"
                value={modal.tokens}
                onChange={(e) => setModal({
                  ...modal,
                  tokens: e.target.value
                })}
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setModal({ ...modal, show: false })}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddTokens}>
                Add Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsManagement;