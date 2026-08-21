export function HowToPlayPage() {
  return (
    <div className="page narrow how-to">
      <header className="page-head">
        <h1>How to play Tango</h1>
        <p className="lede">
          Fill every cell with a Sun or a Moon using logic alone. Same spirit as
          Binairo / Takuzu — with “=” and “×” clues.
        </p>
      </header>

      <section>
        <h2>Goal</h2>
        <p>
          Complete the grid so every row and column follows the four rules below.
          Red cells mean a rule is broken — fix them to finish.
        </p>
      </section>

      <section>
        <h2>1. Balance</h2>
        <p>
          Every row and every column must have exactly half Suns and half Moons.
          On a 6×6 board that’s 3 of each; on 4×4 it’s 2; on 8×8 it’s 4; on 10×10
          it’s 5.
        </p>
      </section>

      <section>
        <h2>2. No three in a row</h2>
        <p>
          Never place three identical symbols next to each other in a row or
          column. Two in a row is fine; three is not.
        </p>
        <p className="example ok">✓ ☀ ☀ ☾ ☀ ☾ ☾</p>
        <p className="example bad">✗ ☀ ☀ ☀ ☾ ☾ ☾</p>
      </section>

      <section>
        <h2>3. “=” clue (same)</h2>
        <p>
          An “=” between two cells means those cells must be the same symbol.
        </p>
      </section>

      <section>
        <h2>4. “×” clue (different)</h2>
        <p>
          A “×” between two cells means those cells must be opposite symbols.
        </p>
      </section>

      <section>
        <h2>Controls</h2>
        <ul>
          <li>Click / tap a cell to cycle: Empty → Sun → Moon → Empty.</li>
          <li>Given (pre-filled) cells cannot be changed.</li>
          <li>Hint fills the next forced cell and explains why.</li>
          <li>Undo and Reset help you recover from mistakes.</li>
        </ul>
      </section>

      <section>
        <h2>Journey</h2>
        <p>
          There are 1000 levels that ramp from easy 4×4 warm-ups to brutal 8×8
          and 10×10 boards. Clear a level to unlock the next. Your best time is
          saved so you can race yourself.
        </p>
      </section>

      <section>
        <h2>Tips</h2>
        <ol>
          <li>Scan clues first — a filled neighbor often forces the partner.</li>
          <li>Count nearly-full rows and columns.</li>
          <li>Hunt for pairs: XX_ and _XX must be the opposite symbol.</li>
          <li>Look for sandwiches: A _ A forces the middle to be the opposite.</li>
          <li>Chain deductions across both axes.</li>
        </ol>
      </section>
    </div>
  )
}
