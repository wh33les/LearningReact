.board {
  display: grid;
  grid - template - columns: repeat(3, 1fr);
  gap: 0px;
}

.mysquare {
  background: var(--secondary - bg);
  border: 1px solid var(--accent - color);
  color: var(--accent - color);
  float: left;
  font - size: 35px;
  font - family: var(--font - family);
  line - height: 34px;
  height: 50px;
  margin - right: -1px;
  margin - top: -1px;
  padding: 0;
  text - align: center;
  width: 50px;
}

.mysquare.empty:hover {
  border: 2px solid var(--accent - color);
  background - color: var(--hover - bg);
}

/* Buttons extend the base button styles */
.mybutton {
  background - color: var(--secondary - bg);
  color: var(--accent - color);
  border: 1px solid var(--accent - color);
  font - size: 16px;
  margin: 0;
}

.mybutton:hover {
  border: 1px solid var(--accent - color);
  background - color: var(--hover - bg);
  color: var(--accent - color);
}

.desc - button {
  background - color: var(--secondary - bg);
  color: var(--accent - color);
  border: 1px solid var(--accent - color);
  font - size: 16px;
  margin: 0;
  border - radius: 0px;
  margin - left: 145px;
}

.desc - button:hover {
  border: 1px solid var(--accent - color);
  background - color: var(--hover - bg);
  color: var(--accent - color);
}

.my - winning - square {
  font - weight: bold;
}

.board - container {
  display: flex;
  justify - content: center;
  align - items: center;
  position: relative;
  width: 300px;
  height: 200px;
  overflow: visible;
  margin - right: -30px;
}

.my - status {
  margin - bottom: -25px;
  text - align: center;
  margin - right: -30px;
}

.my - game - info {
  width: 350px;
  min - height: 300px;
}

.move - info {
  margin - top: -10px;
}

.winning - overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100 %;
  height: 100 %;
  overflow: visible;
  pointer - events: none;
}