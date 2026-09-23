// cores usadas nas etiquetas dos tipos
const TYPE_COLORS = {
  normal:  "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};


// aqui guardamos os elementos do html que vamos usar
// assim fica mais facil acessar eles depois
const els = {
  form: document.getElementById('searchForm'),
  input: document.getElementById('searchInput'),
  stateMessage: document.getElementById('stateMessage'),
  card: document.getElementById('pokemonCard'),
  dexNumber: document.getElementById('dexNumber'),
  sprite: document.getElementById('sprite'),
  model: document.getElementById('model'),
  modelShiny: document.getElementById('model-shiny'),
  name: document.getElementById('pName'),
  meta: document.getElementById('pMeta'),
  typeBadges: document.getElementById('typeBadges'),
  factHeight: document.getElementById('factHeight'),
  factWeight: document.getElementById('factWeight'),
  factExp: document.getElementById('factExp'),
  factDefault: document.getElementById('factDefault'),
  abilityList: document.getElementById('abilityList'),
  statList: document.getElementById('statList'),
  crySection: document.getElementById('crySection'),
  cryBtn: document.getElementById('cryBtn'),
  cryAudio: document.getElementById('cryAudio'),
  quickBtns: document.querySelectorAll('.quick-btn')
};


// mostra mensagens enquanto o pokemon ainda nao foi carregado
function showState(glyph, text){

  // esconde o resultado antigo
  els.card.classList.remove('visible');

  // mostra a mensagem
  els.stateMessage.style.display = 'flex';

  // coloca o simbolo e o texto
  els.stateMessage.innerHTML = `
    <div class="glyph">${glyph}</div>
    <div>${text}</div>
  `;
}


// troca o nome tecnico dos status por nomes mais simples
function statLabel(name){

  const map = {
    hp: 'HP',
    attack: 'ataque',
    defense: 'defesa',
    'special-attack': 'ataque esp.',
    'special-defense': 'defesa esp.',
    speed: 'velocidade'
  };

  return map[name] || name;
}


// essa função consulta a api
async function loadPokemon(query){

  // deixa tudo minusculo para facilitar a busca
  const key = query.trim().toLowerCase();

  // se nao tiver nada digitado nao faz nada
  if(!key) return;

  showState('...', 'Consultando a PokéAPI.');


  try {

    // aqui fazemos a requisição para a pokeapi
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}/`
    );


    // verifica se a api retornou algum erro
    if(!res.ok){

      // erro 404 significa que nao encontrou o pokemon
      if(res.status === 404){

        showState(
          'X',
          `Nenhum Pokémon encontrado para "${query}". Confira o nome ou número.`
        );

      } else {

        // qualquer outro erro da api
        showState(
          '!',
          'A PokéAPI não respondeu como esperado. Tente novamente.'
        );

      }

      return;
    }


    // transforma a resposta em json
    const data = await res.json();

    // manda os dados para aparecer na tela
    renderPokemon(data);


  } catch (err) {

    // caso a internet ou a api de algum problema
    showState(
      '!',
      'Não foi possível conectar à PokéAPI agora. Verifique sua conexão e tente de novo.'
    );

  }
}


// aqui colocamos os dados recebidos pela api no html
function renderPokemon(data){

  // tira a mensagem inicial
  els.stateMessage.style.display = 'none';

  // mostra o card
  els.card.classList.add('visible');


  // mostra o numero da pokedex
  els.dexNumber.textContent =
    `Nº ${String(data.id).padStart(3, '0')}`;


  // tenta pegar a imagem oficial
  // se nao encontrar usa a imagem normal
  const artwork =
    data.sprites?.other?.['official-artwork']?.front_default
    || data.sprites?.front_default
    || '';


  els.sprite.src = artwork;
  els.sprite.alt = data.name;


  // coloca o modelo normal
  els.model.src =
    data.sprites?.other?.['showdown']?.front_default || '';


  // coloca o modelo shiny
  els.modelShiny.src =
    data.sprites?.other?.['showdown']?.front_shiny || '';


  // mostra o nome
  els.name.textContent = data.name;


  // mostra a ordem de aparicao
  els.meta.textContent =
    `Ordem de aparição: ${data.order ?? '—'}`;

    els.typeBadges.innerHTML = '';


  // cria uma etiqueta para cada tipo
  (data.types || []).forEach(t => {

    const badge = document.createElement('span');

    badge.className = 'type-badge';

    badge.textContent = t.type.name;

    // muda a cor dependendo do tipo
    badge.style.background =
      TYPE_COLORS[t.type.name] || '#888';

    els.typeBadges.appendChild(badge);

  });


  // Caracteristiicas do pokemon


  els.factHeight.textContent =
    `${(data.height / 10).toFixed(1)} m`;


  els.factWeight.textContent =
    `${(data.weight / 10).toFixed(1)} kg`;


  els.factExp.textContent =
    data.base_experience != null
      ? data.base_experience
      : '—';



  els.factDefault.textContent =
    data.is_default ? 'sim' : 'não';



  els.abilityList.innerHTML = '';



  (data.abilities || []).forEach(a => {

    const chip = document.createElement('span');

    chip.className =
      'ability-chip' +
      (a.is_hidden ? ' hidden-ability' : '');


    chip.textContent =
      a.ability.name.replace(/-/g, ' ');

    els.abilityList.appendChild(chip);

  });


  // Parte dos status dos pokemons

  els.statList.innerHTML = '';



  (data.stats || []).forEach(s => {

    const max = 180;

    // calcula quanto da barra vai ficar preenchida
    const pct =
      Math.min(
        100,
        Math.round((s.base_stat / max) * 100)
      );


    const row = document.createElement('div');

    row.className = 'stat-row';


    // monta a linha do status
    row.innerHTML = `
      <span class="stat-label">
        ${statLabel(s.stat.name)}
      </span>

      <span class="stat-track">
        <span
          class="stat-fill"
          style="width:${pct}%"
        ></span>
      </span>

      <span class="stat-value">
        ${s.base_stat}
      </span>
    `;


    els.statList.appendChild(row);

  });


  // Parte do audio
  const cryUrl =
    data.cries?.latest ||
    data.cries?.legacy;



  if (cryUrl) {

    els.crySection.style.display = 'block';

    els.cryAudio.src = cryUrl;


  
    els.cryBtn.onclick = () => {

      els.cryAudio.currentTime = 0;

      els.cryAudio.play().catch(() => {});

    };


  } else {

  
    els.crySection.style.display = 'none';

  }
}


// quando o usuario envia a pesquisa
els.form.addEventListener('submit', (e) => {


  e.preventDefault();


  loadPokemon(els.input.value);

});



els.quickBtns.forEach(btn => {

  btn.addEventListener('click', () => {


    els.input.value = btn.dataset.pick;

 
    loadPokemon(btn.dataset.pick);

  });

});


// quando abrir o site ja mostra o bulbasaur
loadPokemon('bulbasaur');