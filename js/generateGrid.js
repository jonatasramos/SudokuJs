/*
 Objeto responsável pela criação dos números dinâmicos na página
*/
const GENERATE_GRID = {
  /* Grid Inicial */
  grids: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  /* Quantidade de números a serem gerados */
  qtdNumber: 0,
  /* Verifica duplicidade de números nos campos */
  isValid: (board, row, col, k) => {
    for (let i = 0; i < 9; i++) {
        const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const n = 3 * Math.floor(col / 3) + i % 3;

        if (board[row][i] == k || board[i][col] == k || board[m][n] == k) {
          return false;
        }
    }
    return true;
  },
  /* Monta a matriz com os números do Grid */
  sudokoGenerate: () => {
    for (var i = 0; i <= GENERATE_GRID.qtdNumber; i++) {
      let linha  = Math.floor(Math.random() * 9);
      let coluna = Math.floor(Math.random() * 9);
      let vlr    = Math.floor(Math.random() * 9);

      if (GENERATE_GRID.grids[linha][coluna] == 0) {
        if (GENERATE_GRID.isValid(GENERATE_GRID.grids, linha, coluna, vlr)) {
          GENERATE_GRID.grids[linha][coluna] = vlr;
        }
      }
    }
  },
  /* Resolve o SUDOKU */
  sodokoSolver: (data) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (data[i][j] == '0') {
          for (let k = 1; k <= 9; k++) {
            if (isValid(data, i, j, k)) {
              data[i][j] = `${k}`;
            if (sodokoSolver(data)) {
             return true;
            } else {
             data[i][j] = '0';
            }
           }
         }
         return false;
       }
     }
   }
   return true;
  }
}

GENERATE_GRID.qtdNumber = 20;
GENERATE_GRID.sudokoGenerate();

var sudoku = {
  /** @description Grid inicial */
  grids: GENERATE_GRID.grids,

  /** @description Váriavel responsável por armazenar os ids dos grupos
    cada número do grupo tem seu data-grupo
    Grupos são:
        Grupo: 1  |  Grupo: 2
        [0,0,0]      [0,0,0]
        [0,0,0]      [0,0,0]
        [0,0,0]      [0,0,0]
   */
  group: 0,

  /** @description Váriavel responsável por armazenar os ids dos números da mesma linha */
  group_line: 1,

  /** @description Contador para montar os grupos */
  cont_group: 1,

  /** @description Váriavel temporária para montar os grupos */
  temp_group: 1,

  /** @description Objeto responsável por armazenar a casa onde o mouse estiver em cima */
  object_home: null,

  /**
    @description Calcula números multiplos
    @param { Number } n número a ser comparado
    @param { Number } m possível multiplo
    @return Resultado da operação
  */
  calcMultiple: (n, m) => {
    return (m % n);
  },

  /**
    @description Gera o HTML do Sudoku
  */
  createSudoku: () => {
    for (var i in sudoku.grids) {
      let rest = sudoku.calcMultiple(3, i);
      let html = "<tr>";
      let body_html = $('.body').html();

      /* Faz a verificação para alinha */
      if (rest == 0 && i != 0){
        sudoku.group_line ++;
      }

      /* Faz a verificação para montar os grupos */
      if (rest == 0) {
        sudoku.group = sudoku.cont_group;
        sudoku.temp_group = sudoku.cont_group;
        sudoku.cont_group += 3;
      } else {
        sudoku.group = sudoku.temp_group;
      }

      for (var j in sudoku.grids[i]) {
        let rest_grid = sudoku.calcMultiple(3, j);

        /* Verifica os multiplos dentro de cada grupo */
        if (rest_grid == 0 && j != 0 ){
          sudoku.group ++;
        }
        html += `<td class="coluna" ${ sudoku.grids[i][j] > 0 ? 'data-edit="not-edit"' : '' }
                data-linha="${ i }" data-coluna="${ j }" data-grupo="${ sudoku.group }" data-grupo_linha="${ sudoku.group_line }">`;
        html += sudoku.grids[i][j] > 0 ? sudoku.grids[i][j] : "";
        html += "</td>";
      }

      html += "</tr>";

      /* Exibe o sudoku */
      $('.body').html(body_html + html);
    }
  },

  /**
    @description Verifica se existem numeros iguais na mesma linha
  */
  verifyLine: (obj) => {
    let line     = obj.attr('data-linha');
    let column   = obj.attr('data-coluna');
    let value    = parseInt(obj.text());
    let consult  = false;

    /* Percorre a linha verificando a existência de números iguais */
    for (var l in sudoku.grids[line]) {
      if (l != column) {
        if (sudoku.grids[line][l] == value){
          obj.css({
            "background-color": "#f00"
          });
          consult = false;
          break
        } else {
          obj.css({
            "background-color": "#fff"
          });
          consult = true;
        }
      }
    }
    /* Caso não exista o número na mesma linha
     ele é colocado na linha. Caso contrário é
    verificado por coluna e grupo*/
    if (consult) {
      if(sudoku.verifyColumn(obj) && sudoku.verifyGroup(obj)) {
        sudoku.grids[line][column] = parseInt(value);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },

  /**
    @description Verifica se existem numeros iguais na mesma coluna
  */
  verifyColumn: (obj) => {
    let line     = obj.attr('data-linha');
    let column   = obj.attr('data-coluna');
    let value    = parseInt(obj.text());
    let consult  = true;

    /* Percorre a coluna verificando a existência de números iguais */
    for (var c in sudoku.grids) {
      if (c != line) {
        if ( sudoku.grids[c][column] == value) {
          obj.css({
            "background-color": "#f00"
          });
          consult = false;
          break;
        } else {
          obj.css({
            "background-color": "#fff"
          });
        }
      }
    }

    return consult;
  },

  /**
    @description Verifica se existem numeros iguais no mesmo grupo
  */
  verifyGroup: (obj) => {
    let line     = obj.attr('data-linha');
    let column   = obj.attr('data-coluna');
    let value    = parseInt(obj.text());
    let group    = parseInt(obj.attr('data-grupo'));
    let consult  = true;

    /* Percorre o grupo verificando a existência de números iguais */
    $('[data-grupo='+ group +']').each(function () {
      let value_h  = $(this).text();
      let line_h   = $(this).attr('data-linha');
      let column_h = $(this).attr('data-coluna');

      if (line != line_h && column != column_h) {
        if (value == value_h && value_h != "") {
          obj.css({
            "background-color": "#f00"
          });
          consult = false;
        }
      }
    });

    return consult;
  },
  /**
    @description Função de click, quando se seleciona um número para uma casa
  */
  action_click: {
    click: function () {
      $('.numbers').hide();
      let linha    = sudoku.object_home.attr('data-linha');
      let coluna   = sudoku.object_home.attr('data-coluna');

      /* Verifica se a casa clicada é editavel */
      if(sudoku.object_home.attr('data-edit') != 'not-edit') {
         sudoku.object_home.css({
            "background-color": "#fff"
         });

        /*  Verifica caso não haja valor no campo */
        if($(this).val() == "") {
          sudoku.grids[linha][coluna] = 0;
          sudoku.object_home.text("");
        } else {
          sudoku.object_home.text($(this).val());
        }

        /* Chama a função para verificar a linha */
        $('.coluna:not([data-edit = "not-edit"])').each(function () {
          sudoku.verifyLine($(this));
        });
      }
    }
  },

  /**
    @description Função quando se clica em uma casa
  */
  action_over: {
    click: function () {
      sudoku.object_home = $(this);
      /* Exibe os números dentro da casa selecionada */
      let top  = $(this).offset().top + 41;
      let left = $(this).offset().left - 42;

      /* Verifica se a casa selecionada é editavel */
      if(sudoku.object_home.attr('data-edit') != 'not-edit') {
        $('.numbers').css('margin-top', top+"px");
        $('.numbers').css('margin-left', left+"px");
        $('.numbers').show();
      } else {
        $('.numbers').hide();
      }
    }
  }
}
