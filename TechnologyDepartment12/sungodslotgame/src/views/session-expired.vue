<template>
  <main class="session-expired">
    <div class="card">
      <h1>会话已过期</h1>
      <p>为保障账户安全，请返回平台重新进入游戏。</p>
    </div>
  </main>
</template>

<style scoped>
.session-expired {
  width: 100vw;
  height: 100dvh;
  display: grid;
  place-content: center;
  background: radial-gradient(circle at 50% -10%, #273b76 0, #111a38 36%, #0e1430 74%);
}
.card {
  padding: 40px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 205, 68, 0.25);
  border-radius: 16px;
  color: #fff;
}
.card h1 {
  margin: 0 0 12px;
  font-size: 22px;
  color: #ffcd44;
}
.card p {
  margin: 0;
  font-size: 14px;
  color: #aab6d7;
  line-height: 1.6;
}
</style>
