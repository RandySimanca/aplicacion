<template>
  <div class="admin-dashboard">
    <h2>Panel de Administración</h2>
    <section class="metrics">
      <h3>Métricas</h3>
      <div class="cards">
        <div class="card"><div class="label">Usuarios</div><div class="value">{{ metrics?.totalUsuarios ?? '-' }}</div></div>
        <div class="card"><div class="label">Bloqueados</div><div class="value">{{ metrics?.usuariosBloqueados ?? '-' }}</div></div>
      </div>
      <details>
        <summary>Top descargas</summary>
        <ul>
          <li v-for="u in metrics?.topDescargas || []" :key="u._id">{{ u.nombre }} ({{ u.email }}) — {{ u.descargasRealizadas }}</li>
        </ul>
      </details>
    </section>

    <section class="unlock-codes">
      <h3>Códigos de desbloqueo</h3>
      <form class="row" @submit.prevent="handleCreate">
        <input v-model="form.code" placeholder="Código" />
        <input v-model="form.description" placeholder="Descripción" />
        <label><input type="checkbox" v-model="form.isMaster" /> Maestro</label>
        <input v-model.number="form.usageLimit" type="number" min="0" placeholder="Límite (0=∞)" />
        <input v-model="form.validFrom" type="date" />
        <input v-model="form.validUntil" type="date" />
        <label><input type="checkbox" v-model="form.active" /> Activo</label>
        <button :disabled="loadingCreate">{{ loadingCreate ? 'Creando...' : 'Crear' }}</button>
      </form>

      <table class="codes">
        <thead>
          <tr>
            <th>Código</th>
            <th>Maestro</th>
            <th>Uso</th>
            <th>Vigencia</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in codes" :key="c._id">
            <td>{{ c.code }}</td>
            <td>{{ c.isMaster ? 'Sí' : 'No' }}</td>
            <td>{{ c.usedCount }}/{{ c.usageLimit === 0 ? '∞' : c.usageLimit }}</td>
            <td>
              <span>{{ fmtDate(c.validFrom) }} - {{ fmtDate(c.validUntil) }}</span>
            </td>
            <td>
              <input type="checkbox" :checked="c.active" @change="toggleActive(c)" />
            </td>
            <td>
              <button @click="remove(c)" class="danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="users">
      <h3>Usuarios</h3>
      <div class="users-list">
        <button @click="loadUsers" :disabled="loadingUsers">Recargar usuarios</button>
        <ul>
          <li v-for="u in users" :key="u._id">
            {{ u.nombre }} ({{ u.email }})
            — Descargas: {{ u.descargasRealizadas ?? 0 }}
            — <label>Bloqueado <input type="checkbox" :checked="!!u.bloqueado" @change="toggleBlock(u)" /></label>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../helpers/axiosInstance';

const metrics = ref(null);
const codes = ref([]);
const users = ref([]);
const loadingCreate = ref(false);
const loadingUsers = ref(false);

const form = reactive({
  code: '',
  description: '',
  isMaster: false,
  usageLimit: 0,
  validFrom: '',
  validUntil: '',
  active: true,
});

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toISOString().slice(0, 10);
}

async function fetchMetrics() {
  const { data } = await api.get('/admin/metrics', { params: { minDownloads: 5 } });
  metrics.value = data;
}

async function fetchCodes() {
  const { data } = await api.get('/admin/unlock-codes');
  codes.value = data;
}

async function handleCreate() {
  loadingCreate.value = true;
  try {
    const payload = { ...form };
    const { data } = await api.post('/admin/unlock-codes', payload);
    codes.value.unshift(data);
    form.code = '';
    form.description = '';
    form.isMaster = false;
    form.usageLimit = 0;
    form.validFrom = '';
    form.validUntil = '';
    form.active = true;
  } finally {
    loadingCreate.value = false;
  }
}

async function toggleActive(c) {
  const { data } = await api.patch(`/admin/unlock-codes/${c._id}`, { active: !c.active });
  Object.assign(c, data);
}

async function remove(c) {
  if (!confirm(`Eliminar código ${c.code}?`)) return;
  await api.delete(`/admin/unlock-codes/${c._id}`);
  codes.value = codes.value.filter((x) => x._id !== c._id);
}

async function loadUsers() {
  loadingUsers.value = true;
  try {
    const { data } = await api.get('/admin/usuarios');
    users.value = data;
  } finally {
    loadingUsers.value = false;
  }
}

async function toggleBlock(u) {
  const { data } = await api.patch(`/admin/usuarios/${u._id}/bloqueo`, { bloqueado: !u.bloqueado });
  Object.assign(u, data);
}

onMounted(async () => {
  await Promise.all([fetchMetrics(), fetchCodes(), loadUsers()]);
});
</script>

<style scoped>
.admin-dashboard { padding: 1rem; }
.cards { display: flex; gap: 1rem; margin-bottom: 1rem; }
.card { background: #f5f5ff; border: 1px solid #e5e7eb; border-radius: 8px; padding: .75rem 1rem; }
.card .label { font-size: .85rem; color: #6b7280; }
.card .value { font-weight: bold; font-size: 1.3rem; }
.row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .5rem; align-items: center; margin-bottom: 1rem; }
.codes { width: 100%; border-collapse: collapse; }
.codes th, .codes td { border-bottom: 1px solid #e5e7eb; padding: .5rem; }
.danger { color: #b91c1c; }
</style>

