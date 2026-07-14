// crossword_puzzle_py3_final_cleaned.py 를 그대로 JS로 포팅한 엔진
class Word {
    constructor(word, clue) {
        this.word = word.replace(/\s/g, '').toLowerCase();
        this.clue = clue;
        this.length = this.word.length;
        this.row = null;
        this.col = null;
        this.vertical = null;
        this.number = null;
    }
    downAcross() {
        return this.vertical ? 'down' : 'across';
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

class CrosswordEngine {
    constructor(cols, rows, empty, maxloops, availableWords, backboneText = null, backboneClue = '더미 단어') {
        this.cols = cols;
        this.rows = rows;
        this.empty = empty;
        this.maxloops = maxloops;
        this.availableWords = availableWords; // [[word, clue], ...] or Word[]
        this.backboneText = backboneText; // 예: 한국어 "가나다라마바사아자차카타파하" (교차점 확보용 백본). 없으면 null
        this.backboneClue = backboneClue;
        this.randomizeWordList();
        this.currentWordList = [];
        this.clearGrid();
    }

    clearGrid() {
        this.grid = [];
        for (let i = 0; i < this.rows; i++) {
            this.grid.push(new Array(this.cols).fill(this.empty));
        }
    }

    randomizeWordList() {
        let tempList = this.availableWords.map(w => (w instanceof Word) ? new Word(w.word, w.clue) : new Word(w[0], w[1]));
        shuffle(tempList);
        tempList.sort((a, b) => b.word.length - a.word.length);
        this.availableWords = tempList;
    }

    computeCrossword(timePermittedSec = 1.0, spins = 2) {
        let count = 0;
        let cp = new CrosswordEngine(this.cols, this.rows, this.empty, this.maxloops, this.availableWords, this.backboneText, this.backboneClue);
        const startFull = Date.now();

        // 백본(예: 한국어 "가나다라마바사아자차카타파하")은 매 시도마다 그리드 정중앙에
        // 가로로 강제 배치됩니다. 한글은 음절 블록 단위라 낱글자 알파벳처럼 자연스럽게
        // 교차하기 어려워서, 흔한 첫 음절 14개를 미리 깔아두고 실제 단어들이 그 위에
        // 세로로 교차할 기회를 만들어주는 장치입니다. 최종 화면에는 이 백본 자체는
        // 안 보이고(정답 목록에서 제외), 실제 단어와 겹친 글자들만 자연스럽게 남습니다.
        // 백본(예: 한국어 "가나다라마바사아자차카타파하", 중국어는 빈도순 자동계산)은
        // 매 시도마다 그리드 정중앙에 "가로+세로 십자(+)" 모양으로 강제 배치됩니다.
        // 가로는 정중앙에 직접 놓고, 세로는 이미 놓인 가로 백본과 겹치는 글자를
        // fitAndAdd(기존 교차점 탐색 로직 재사용)로 자동으로 찾아서 교차시킵니다.
        const backboneWord = this.backboneText ? new Word(this.backboneText, this.backboneClue) : null;
        const backboneWordVertical = this.backboneText ? new Word(this.backboneText, this.backboneClue) : null;

        while ((Date.now() - startFull) < timePermittedSec * 1000 || count === 0) {
            cp.currentWordList = [];
            cp.clearGrid();
            cp.randomizeWordList();
            let x = 0;

            if (backboneWord) {
                const midRow = Math.floor(this.rows / 2);
                const midCol = Math.floor(this.cols / 2) - Math.floor(backboneWord.length / 2);
                if (cp.checkFitScore(midCol + 1, midRow + 1, 0, backboneWord)) {
                    cp.setWord(midCol + 1, midRow + 1, 0, backboneWord, true); // setWord가 currentWordList에 자동으로 추가함

                    // 십자 모양 완성: 세로 백본을 가로 백본과 교차하는 지점에 배치
                    // (같은 문자열이라 fitAndAdd를 그냥 쓰면 "가로 자리에 완전히 겹쳐 놓기"를
                    //  최고점으로 착각해 또 가로로 얹어버릴 수 있어서, 세로(vertical=1)만
                    //  걸러서 확실히 십자 방향으로 배치되게 함)
                    const vCoords = cp.suggestCoord(backboneWordVertical).filter(c => c[2] === 1);
                    if (vCoords.length) {
                        const [vcol, vrow, vvert] = vCoords[0];
                        cp.setWord(vcol, vrow, vvert, backboneWordVertical, true); // 여기도 setWord가 자동으로 추가함
                    }
                }
            }

            while (x < spins) {
                for (const word of cp.availableWords) {
                    if (!cp.currentWordList.includes(word)) {
                        cp.fitAndAdd(word);
                    }
                }
                x++;
            }
            if (cp.currentWordList.length > this.currentWordList.length) {
                this.currentWordList = cp.currentWordList;
                this.grid = cp.grid;
            }
            count++;
        }
        this.debug = count;
    }

    suggestCoord(word) {
        let coordlist = [];
        let glc = -1;
        for (const givenLetter of word.word) {
            glc++;
            let rowc = 0;
            for (const row of this.grid) {
                rowc++;
                let colc = 0;
                for (const cell of row) {
                    colc++;
                    if (givenLetter === cell) {
                        if (rowc - glc > 0) {
                            if ((rowc - glc) + word.length <= this.rows) {
                                coordlist.push([colc, rowc - glc, 1, colc + (rowc - glc), 0]);
                            }
                        }
                        if (colc - glc > 0) {
                            if ((colc - glc) + word.length <= this.cols) {
                                coordlist.push([colc - glc, rowc, 0, rowc + (colc - glc), 0]);
                            }
                        }
                    }
                }
            }
        }
        return this.sortCoordlist(coordlist, word);
    }

    sortCoordlist(coordlist, word) {
        let newCoordlist = [];
        for (const coord of coordlist) {
            const [col, row, vertical] = coord;
            coord[4] = this.checkFitScore(col, row, vertical, word);
            if (coord[4]) newCoordlist.push(coord);
        }
        shuffle(newCoordlist);
        newCoordlist.sort((a, b) => b[4] - a[4]);
        return newCoordlist;
    }

    fitAndAdd(word) {
        let fit = false;
        let count = 0;
        const coordlist = this.suggestCoord(word);

        while (!fit && count < this.maxloops) {
            if (this.currentWordList.length === 0) {
                const vertical = Math.random() < 0.5 ? 0 : 1;
                const col = 1, row = 1;
                if (this.checkFitScore(col, row, vertical, word)) {
                    fit = true;
                    this.setWord(col, row, vertical, word, true);
                }
            } else {
                if (count >= coordlist.length) return;
                const [col, row, vertical, , score] = coordlist[count];
                if (score) {
                    fit = true;
                    this.setWord(col, row, vertical, word, true);
                }
            }
            count++;
        }
    }

    checkFitScore(col, row, vertical, word) {
        if (col < 1 || row < 1) return 0;
        let count = 1, score = 1;
        let c = col, r = row;
        for (const letter of word.word) {
            let activeCell;
            try {
                activeCell = this.getCell(c, r);
            } catch (e) {
                return 0;
            }
            if (activeCell === this.empty || activeCell === letter) {
                // ok
            } else {
                return 0;
            }
            if (activeCell === letter) score++;

            if (vertical) {
                if (activeCell !== letter) {
                    if (!this.checkIfCellClear(c + 1, r)) return 0;
                    if (!this.checkIfCellClear(c - 1, r)) return 0;
                }
                if (count === 1) {
                    if (!this.checkIfCellClear(c, r - 1)) return 0;
                }
                if (count === word.word.length) {
                    if (!this.checkIfCellClear(c, r + 1)) return 0;
                }
            } else {
                if (activeCell !== letter) {
                    if (!this.checkIfCellClear(c, r - 1)) return 0;
                    if (!this.checkIfCellClear(c, r + 1)) return 0;
                }
                if (count === 1) {
                    if (!this.checkIfCellClear(c - 1, r)) return 0;
                }
                if (count === word.word.length) {
                    if (!this.checkIfCellClear(c + 1, r)) return 0;
                }
            }

            if (vertical) r++; else c++;
            count++;
        }
        return score;
    }

    setWord(col, row, vertical, word, force) {
        if (force) {
            word.col = col;
            word.row = row;
            word.vertical = vertical;
            this.currentWordList.push(word);
            let c = col, r = row;
            for (const letter of word.word) {
                this.setCell(c, r, letter);
                if (vertical) r++; else c++;
            }
        }
    }

    setCell(col, row, value) {
        this.grid[row - 1][col - 1] = value;
    }

    getCell(col, row) {
        let r = row - 1;
        let c = col - 1;
        if (r < -this.rows || r >= this.rows || c < -this.cols || c >= this.cols) {
            throw new Error('out of bounds');
        }
        if (r < 0) r += this.rows; // Python의 grid[-1] wrap-around 동작 재현
        if (c < 0) c += this.cols;
        return this.grid[r][c];
    }

    checkIfCellClear(col, row) {
        try {
            return this.getCell(col, row) === this.empty;
        } catch (e) {
            return false;
        }
    }

    orderNumberWords() {
        this.currentWordList.sort((a, b) => (a.col + a.row) - (b.col + b.row));
        let count = 1, icount = 1;
        for (const word of this.currentWordList) {
            word.number = count;
            if (icount < this.currentWordList.length) {
                const next = this.currentWordList[icount];
                if (!(word.col === next.col && word.row === next.row)) {
                    count++;
                }
            }
            icount++;
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = { Word, CrosswordEngine };
}
