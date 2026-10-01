import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  FileUp,
  Globe2,
  Landmark,
  MapPin,
  Menu,
  Package,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { worldFixture } from "@simulation-external/world-fixtures";
import {
  parseWorldExchange,
  type WorldExchange,
} from "@simulation-external/world-io";
import {
  allEntities,
  asText,
  COLLECTIONS,
  collectionEntries,
  collectionMeta,
  entityDescription,
  entityFields,
  entityId,
  entityName,
  eventYear,
  formatValue,
  humanizeField,
  relatedEntities,
  searchEntities,
  sortEvents,
  type CollectionKey,
  type EntityEntry,
  worldDescription,
  worldName,
  readField,
} from "./lib/world";

type MainView = "overview" | "timeline" | CollectionKey;
type ExchangeSource = "fixture" | "portable-file";

const iconFor = (icon: string, size = 16) => {
  const props = { size, strokeWidth: 1.8 };
  switch (icon) {
    case "person":
      return <Users {...props} />;
    case "city":
      return <Building2 {...props} />;
    case "location":
      return <MapPin {...props} />;
    case "organization":
      return <Boxes {...props} />;
    case "institution":
      return <Landmark {...props} />;
    case "faction":
      return <Sparkles {...props} />;
    case "item":
      return <Package {...props} />;
    case "history":
      return <Clock3 {...props} />;
    case "relationship":
      return <ArrowUpRight {...props} />;
    default:
      return <Compass {...props} />;
  }
};

function keyOf(entry: EntityEntry): string {
  return `${entry.collection}:${entityId(entry.entity)}`;
}

function App() {
  const [world, setWorld] = useState<WorldExchange>(worldFixture);
  const [source, setSource] = useState<ExchangeSource>("fixture");
  const [view, setView] = useState<MainView>("overview");
  const [selected, setSelected] = useState<EntityEntry | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [historyStack, setHistoryStack] = useState<EntityEntry[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const worldFileInput = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const entities = useMemo(() => allEntities(world), [world]);
  const results = useMemo(
    () => searchEntities(world, query).slice(0, 8),
    [world, query],
  );
  const eventEntries = useMemo(
    () => sortEvents(collectionEntries(world, "historicalEvents")),
    [world],
  );

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLocaleLowerCase() === "k"
      ) {
        event.preventDefault();
        searchInput.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const selectEntry = (entry: EntityEntry) => {
    if (selected && keyOf(selected) !== keyOf(entry)) {
      setHistoryStack((history) => [...history.slice(-19), selected]);
    }
    setSelected(entry);
    if (entry.collection === "historicalEvents") setView("timeline");
    else setView(entry.collection);
    setSearchOpen(false);
    setQuery("");
    setMobileNavOpen(false);
  };

  const navigateBack = () => {
    const previous = historyStack.at(-1);
    if (!previous) return;
    setHistoryStack((history) => history.slice(0, -1));
    setSelected(previous);
    setView(
      previous.collection === "historicalEvents"
        ? "timeline"
        : previous.collection,
    );
  };

  const goToView = (next: MainView) => {
    setView(next);
    setSelected(null);
    setMobileNavOpen(false);
  };

  const useDemoFixture = () => {
    setWorld(worldFixture);
    setSource("fixture");
    setLoadError(null);
    setView("overview");
    setSelected(null);
    setHistoryStack([]);
    setQuery("");
    setSearchOpen(false);
  };

  const loadWorldFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setLoadError(null);
    setLoadingFile(true);
    try {
      const exchange = parseWorldExchange(await file.arrayBuffer());
      setWorld(exchange);
      setSource("portable-file");
      setView("overview");
      setSelected(null);
      setHistoryStack([]);
      setQuery("");
      setSearchOpen(false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu icon-button"
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <Menu size={20} />
        </button>
        <button
          className="brand"
          type="button"
          onClick={() => goToView("overview")}
          aria-label="World Explorer home"
        >
          <span className="brand-mark">
            <Compass size={18} />
          </span>
          <span>
            atlas<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="topbar-divider" />
        <div className="current-world">
          <span className="world-status" />
          {worldName(world)}
          <ChevronDown size={14} />
        </div>
        <div className="search-wrap">
          <Search size={17} className="search-icon" />
          <input
            ref={searchInput}
            aria-label="Search the world"
            placeholder="Search anything in this world..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
              if (event.key === "Enter" && results[0]) selectEntry(results[0]);
            }}
          />
          {query && (
            <button
              className="search-clear"
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          )}
          {!query && <kbd>⌘ K</kbd>}
          {searchOpen && query.trim() && (
            <div
              className="search-results"
              role="listbox"
              aria-label="Search results"
            >
              <div className="search-result-heading">
                {results.length ? "Jump to an entry" : "No matching entries"}
              </div>
              {results.map((entry) => {
                const meta = collectionMeta(entry.collection);
                return (
                  <button
                    className="search-result"
                    type="button"
                    key={keyOf(entry)}
                    onClick={() => selectEntry(entry)}
                  >
                    <span className={`small-icon ${meta.color}`}>
                      {iconFor(meta.icon, 14)}
                    </span>
                    <span className="search-result-copy">
                      <strong>{entityName(entry.entity)}</strong>
                      <small>{meta.singular}</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="topbar-spacer" />
        <button
          className="help-link"
          type="button"
          onClick={() => goToView("overview")}
        >
          <BookOpen size={16} /> Guide
        </button>
        <div className="avatar" aria-label="Demo workspace">
          W
        </div>
      </header>

      {searchOpen && (
        <button
          className="dismiss-search"
          aria-label="Close search results"
          type="button"
          onClick={() => setSearchOpen(false)}
        />
      )}

      <div className="workspace">
        <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-scroll">
            <div className="sidebar-label">WORKSPACE</div>
            <button
              className={`nav-item ${view === "overview" ? "active" : ""}`}
              onClick={() => goToView("overview")}
              type="button"
            >
              <Globe2 size={17} />
              <span>Overview</span>
              <span className="nav-shortcut">⌘ 1</span>
            </button>
            <button
              className={`nav-item ${view === "timeline" ? "active" : ""}`}
              onClick={() => goToView("timeline")}
              type="button"
            >
              <Clock3 size={17} />
              <span>Timeline</span>
              <span className="nav-count">
                {collectionEntries(world, "historicalEvents").length}
              </span>
            </button>
            <div className="sidebar-rule" />
            <div className="sidebar-label nav-label-row">
              <span>EXPLORE</span>
              <span className="sidebar-label-count">{entities.length}</span>
            </div>
            <nav aria-label="World entities" className="entity-nav">
              {COLLECTIONS.map((collection) => {
                const count = collectionEntries(world, collection.key).length;
                return (
                  <button
                    className={`nav-item ${view === collection.key ? "active" : ""}`}
                    key={collection.key}
                    onClick={() => goToView(collection.key)}
                    type="button"
                  >
                    <span className={`nav-icon ${collection.color}`}>
                      {iconFor(collection.icon, 16)}
                    </span>
                    <span>{collection.label}</span>
                    <span className="nav-count">{count}</span>
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-rule" />
            <div className="sidebar-label">SAVED VIEWS</div>
            <button
              className="nav-item saved-view"
              onClick={() => goToView("people")}
              type="button"
            >
              <span className="saved-dot dot-sun" />
              <span>Key characters</span>
            </button>
            <button
              className="nav-item saved-view"
              onClick={() => goToView("cities")}
              type="button"
            >
              <span className="saved-dot dot-sky" />
              <span>Places to know</span>
            </button>
          </div>
          <div className="sidebar-footer">
            <div className="footer-world-icon">
              <Globe2 size={16} />
            </div>
            <div className="footer-world-copy">
              <strong>{worldName(world)}</strong>
              <span>
                {source === "fixture" ? "Fixture workspace" : "Local JSON file"}
              </span>
            </div>
            <button
              aria-label="Workspace options"
              className="icon-button footer-more"
              type="button"
            >
              <span>···</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-toolbar">
            <div className="breadcrumbs">
              <span>Worlds</span>
              <ChevronRight size={13} />
              <strong>
                {view === "overview"
                  ? "Overview"
                  : view === "timeline"
                    ? "Timeline"
                    : collectionMeta(view).label}
              </strong>
            </div>
            <div className="toolbar-actions">
              <button
                className="quiet-button"
                type="button"
                onClick={navigateBack}
                disabled={historyStack.length === 0}
                aria-label="Go to previous entry"
              >
                <ArrowDownRight className="back-arrow" size={14} /> Back
              </button>
              <span className="toolbar-divider" />
              <button
                className="quiet-button"
                type="button"
                onClick={() => goToView("overview")}
              >
                <Sparkles size={14} /> Explore
              </button>
              <button
                className="quiet-button"
                type="button"
                onClick={() => worldFileInput.current?.click()}
                disabled={loadingFile}
                aria-label="Load World Exchange file"
              >
                <FileUp size={14} /> {loadingFile ? "Loading…" : "Load file"}
              </button>
              {source === "portable-file" && (
                <button
                  className="quiet-button"
                  type="button"
                  onClick={useDemoFixture}
                >
                  Use demo fixture
                </button>
              )}
              <input
                ref={worldFileInput}
                className="file-input-hidden"
                type="file"
                accept=".world.json,application/json"
                aria-label="World Exchange file"
                onChange={(event) => void loadWorldFile(event)}
              />
            </div>
          </div>
          {loadError && (
            <div className="load-error" role="alert">
              <strong>Could not load World Exchange file</strong>
              <span>{loadError}</span>
            </div>
          )}
          <div className="content-scroll">
            {view === "overview" ? (
              <Overview
                world={world}
                entries={entities}
                eventEntries={eventEntries}
                onSelect={selectEntry}
                onView={goToView}
              />
            ) : view === "timeline" ? (
              <Timeline
                world={world}
                events={eventEntries}
                selected={selected}
                onSelect={selectEntry}
              />
            ) : (
              <CollectionView
                world={world}
                collection={view}
                selected={selected}
                onSelect={selectEntry}
              />
            )}
          </div>
        </main>

        <aside className={`inspector ${selected ? "inspector-open" : ""}`}>
          {selected ? (
            <DetailsPanel
              world={world}
              entry={selected}
              onSelect={selectEntry}
              onClose={() => setSelected(null)}
            />
          ) : (
            <WelcomePanel
              world={world}
              source={source}
              onSelect={selectEntry}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function Overview({
  world: exchange,
  entries,
  eventEntries,
  onSelect,
  onView,
}: {
  world: WorldExchange;
  entries: EntityEntry[];
  eventEntries: EntityEntry[];
  onSelect: (entry: EntityEntry) => void;
  onView: (view: MainView) => void;
}) {
  const metadata = readField(exchange, "world");
  const era =
    metadata && typeof metadata === "object"
      ? asText(readField(metadata, "era"))
      : undefined;
  const people = collectionEntries(exchange, "people").slice(0, 4);
  const cities = collectionEntries(exchange, "cities").slice(0, 3);
  const recentEvents = [...eventEntries].reverse().slice(0, 3);

  return (
    <div className="overview-page">
      <section className="welcome-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> WORLD AT A GLANCE
          </div>
          <h1>
            Welcome to
            <br />
            <em>{worldName(exchange)}</em>
          </h1>
          <p>{worldDescription(exchange)}</p>
          <div className="hero-meta">
            {era && (
              <span>
                <span className="meta-dot" />
                {era}
              </span>
            )}
            <span>
              <Globe2 size={14} /> Connected world
            </span>
            <span>
              <Users size={14} /> {entries.length} connected entries
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-sun" />
          <span className="orbit-point point-a" />
          <span className="orbit-point point-b" />
          <span className="orbit-point point-c" />
          <span className="hero-art-caption">
            DISCOVER · CONNECT · UNDERSTAND
          </span>
        </div>
      </section>

      <section className="stat-grid" aria-label="World totals">
        {COLLECTIONS.slice(0, 4).map(({ key, label, color, icon }) => (
          <button
            key={key}
            type="button"
            className="stat-card"
            onClick={() => onView(key)}
          >
            <span className={`stat-icon ${color}`}>{iconFor(icon, 17)}</span>
            <span className="stat-number">
              {collectionEntries(exchange, key).length}
            </span>
            <span className="stat-label">{label.toLowerCase()}</span>
            <ArrowUpRight size={15} className="stat-arrow" />
          </button>
        ))}
      </section>

      <div className="overview-columns">
        <section className="section-card people-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow eyebrow-muted">THE PEOPLE</div>
              <h2>Characters to know</h2>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => onView("people")}
            >
              All people <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="person-list">
            {people.map((entry, index) => (
              <button
                className="person-row"
                key={keyOf(entry)}
                type="button"
                onClick={() => onSelect(entry)}
              >
                <span className={`person-avatar avatar-${index + 1}`}>
                  {entityName(entry.entity)
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="person-copy">
                  <strong>{entityName(entry.entity)}</strong>
                  <small>
                    {asText(readField(entry.entity, "occupation")) ??
                      "World character"}
                  </small>
                </span>
                <ArrowUpRight size={15} className="row-arrow" />
              </button>
            ))}
            {!people.length && (
              <EmptyLine text="No people have been added yet." />
            )}
          </div>
        </section>

        <section className="section-card history-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow eyebrow-muted">WHAT CAME BEFORE</div>
              <h2>Recent history</h2>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => onView("timeline")}
            >
              Timeline <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="mini-timeline">
            {recentEvents.map((entry) => (
              <button
                type="button"
                key={keyOf(entry)}
                className="mini-event"
                onClick={() => onSelect(entry)}
              >
                <span className="mini-event-year">
                  {eventYear(entry.entity) ?? "—"}
                </span>
                <span className="mini-event-marker" />
                <span className="mini-event-copy">
                  <strong>{entityName(entry.entity)}</strong>
                  <small>
                    {entityDescription(entry.entity) ??
                      "Explore this event and its connections."}
                  </small>
                </span>
              </button>
            ))}
            {!recentEvents.length && (
              <EmptyLine text="No historical events are recorded yet." />
            )}
          </div>
        </section>
      </div>

      <section className="places-strip">
        <div className="places-intro">
          <div className="eyebrow eyebrow-muted">PLACES</div>
          <h2>Somewhere to begin</h2>
          <p>Every story happens somewhere. Start with a place.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => onView("cities")}
          >
            Explore places <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="city-cards">
          {cities.map((entry, index) => (
            <button
              className={`city-card city-card-${index + 1}`}
              type="button"
              key={keyOf(entry)}
              onClick={() => onSelect(entry)}
            >
              <span className="city-illustration">
                <span className="city-moon" />
                <span className="city-building building-one" />
                <span className="city-building building-two" />
                <span className="city-building building-three" />
              </span>
              <span className="city-title">{entityName(entry.entity)}</span>
              <span className="city-region">
                {asText(readField(entry.entity, "region")) ??
                  asText(readField(entry.entity, "kind")) ??
                  "Settlement"}
              </span>
            </button>
          ))}
          {!cities.length && (
            <EmptyLine text="No cities have been added yet." />
          )}
        </div>
      </section>
    </div>
  );
}

function CollectionView({
  world: exchange,
  collection,
  selected,
  onSelect,
}: {
  world: WorldExchange;
  collection: CollectionKey;
  selected: EntityEntry | null;
  onSelect: (entry: EntityEntry) => void;
}) {
  const meta = collectionMeta(collection);
  const entries = collectionEntries(exchange, collection);
  const [filter, setFilter] = useState("");
  const visible = entries.filter(({ entity }) =>
    `${entityName(entity)} ${entityDescription(entity) ?? ""}`
      .toLocaleLowerCase()
      .includes(filter.toLocaleLowerCase()),
  );
  return (
    <div className="collection-page">
      <div className="collection-heading-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> DIRECTORY
          </div>
          <h1>{meta.label}</h1>
          <p>
            Browse and connect the {meta.label.toLocaleLowerCase()} in{" "}
            {worldName(exchange)}.
          </p>
        </div>
        <span className={`collection-hero-icon ${meta.color}`}>
          {iconFor(meta.icon, 24)}
        </span>
      </div>
      <div className="collection-controls">
        <span className="result-count">
          <strong>{visible.length}</strong>{" "}
          {visible.length === 1
            ? meta.singular.toLocaleLowerCase()
            : meta.label.toLocaleLowerCase()}
        </span>
        <label className="filter-input">
          <Search size={15} />
          <input
            aria-label={`Filter ${meta.label}`}
            placeholder={`Filter ${meta.label.toLocaleLowerCase()}...`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
      </div>
      {visible.length ? (
        <div className="entity-grid">
          {visible.map((entry, index) => (
            <EntityCard
              key={keyOf(entry)}
              world={exchange}
              entry={entry}
              index={index}
              active={selected ? keyOf(selected) === keyOf(entry) : false}
              onClick={() => onSelect(entry)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>{iconFor(meta.icon, 23)}</span>
          <strong>
            {filter
              ? "No matches found"
              : `No ${meta.label.toLocaleLowerCase()} yet`}
          </strong>
          <p>
            {filter
              ? "Try a different search term."
              : "This directory is ready for its first entry."}
          </p>
        </div>
      )}
    </div>
  );
}

function EntityCard({
  world: exchange,
  entry,
  index,
  active,
  onClick,
}: {
  world: WorldExchange;
  entry: EntityEntry;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const meta = collectionMeta(entry.collection);
  const description = entityDescription(entry.entity);
  const secondary =
    asText(readField(entry.entity, "occupation")) ??
    asText(readField(entry.entity, "type")) ??
    asText(readField(entry.entity, "region")) ??
    asText(readField(entry.entity, "ideology"));
  return (
    <button
      type="button"
      className={`entity-card ${active ? "entity-card-active" : ""}`}
      onClick={onClick}
    >
      <div className={`entity-card-visual visual-${(index % 4) + 1}`}>
        <span className={`entity-card-icon ${meta.color}`}>
          {iconFor(meta.icon, 20)}
        </span>
        <span className="entity-card-id">{entityId(entry.entity)}</span>
      </div>
      <div className="entity-card-body">
        <span className="entity-kicker">{secondary ?? meta.singular}</span>
        <h3>{entityName(entry.entity)}</h3>
        <p>
          {description ??
            `Discover how this ${meta.singular.toLocaleLowerCase()} fits into ${worldName(exchange)}.`}
        </p>
        <span className="entity-card-link">
          View details <ArrowUpRight size={14} />
        </span>
      </div>
    </button>
  );
}

function Timeline({
  world: exchange,
  events,
  selected,
  onSelect,
}: {
  world: WorldExchange;
  events: EntityEntry[];
  selected: EntityEntry | null;
  onSelect: (entry: EntityEntry) => void;
}) {
  const [direction, setDirection] = useState<"oldest" | "newest">("oldest");
  const ordered = direction === "oldest" ? events : [...events].reverse();
  return (
    <div className="timeline-page">
      <div className="collection-heading-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE STORY SO FAR
          </div>
          <h1>Timeline</h1>
          <p>Explore the moments that shaped {worldName(exchange)}.</p>
        </div>
        <span className="collection-hero-icon pink">
          <Clock3 size={24} />
        </span>
      </div>
      <div className="timeline-tools">
        <span>
          <strong>{events.length}</strong> recorded events
        </span>
        <button
          className="quiet-button"
          type="button"
          onClick={() =>
            setDirection(direction === "oldest" ? "newest" : "oldest")
          }
        >
          {direction === "oldest" ? "Oldest first" : "Newest first"}
          <ChevronDown size={14} />
        </button>
      </div>
      {ordered.length ? (
        <div className="timeline-list">
          {ordered.map((entry, index) => (
            <button
              type="button"
              key={keyOf(entry)}
              className={`timeline-event ${selected && keyOf(selected) === keyOf(entry) ? "timeline-event-active" : ""}`}
              onClick={() => onSelect(entry)}
            >
              <span className="timeline-date">
                {eventYear(entry.entity) ?? "UNDATED"}
              </span>
              <span className="timeline-track">
                <span className="timeline-dot" />
              </span>
              <span className="timeline-event-content">
                <span className="timeline-index">
                  CHAPTER {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{entityName(entry.entity)}</strong>
                <small>
                  {entityDescription(entry.entity) ??
                    "An event in the history of this world."}
                </small>
                <span className="timeline-open">
                  Open event <ArrowUpRight size={13} />
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>
            <Clock3 size={23} />
          </span>
          <strong>No history recorded yet</strong>
          <p>
            Historical events will appear here as they are added to the world.
          </p>
        </div>
      )}
    </div>
  );
}

function DetailsPanel({
  world: exchange,
  entry,
  onSelect,
  onClose,
}: {
  world: WorldExchange;
  entry: EntityEntry;
  onSelect: (entry: EntityEntry) => void;
  onClose: () => void;
}) {
  const meta = collectionMeta(entry.collection);
  const description = entityDescription(entry.entity);
  const related = relatedEntities(exchange, entry);
  const year =
    entry.collection === "historicalEvents"
      ? eventYear(entry.entity)
      : undefined;
  return (
    <div className="details-panel">
      <div className="inspector-top">
        <span className="inspector-label">ENTRY DETAILS</span>
        <button
          type="button"
          className="icon-button close-inspector"
          aria-label="Close details"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      <div className={`details-cover cover-${meta.color}`}>
        <span className="cover-orbit orbit-left" />
        <span className="cover-orbit orbit-right" />
        <span className={`cover-icon ${meta.color}`}>
          {iconFor(meta.icon, 24)}
        </span>
        <span className="cover-tag">{meta.singular.toUpperCase()}</span>
      </div>
      <div className="details-heading">
        <h2>{entityName(entry.entity)}</h2>
        <div className="details-id">{entityId(entry.entity)}</div>
        {year !== undefined && <div className="event-year-chip">{year}</div>}
      </div>
      {description && <p className="details-description">{description}</p>}
      <div className="detail-separator" />
      <div className="details-section-title">
        ABOUT <span>{entityFields(entry.entity).length}</span>
      </div>
      <dl className="field-list">
        {entityFields(entry.entity).map(([key, value]) => (
          <div className="field-row" key={key}>
            <dt>{humanizeField(key)}</dt>
            <dd>{formatValue(value)}</dd>
          </div>
        ))}
        {!entityFields(entry.entity).length && (
          <div className="field-empty">No additional fields are available.</div>
        )}
      </dl>
      {related.length > 0 && (
        <>
          <div className="detail-separator related-separator" />
          <div className="details-section-title">
            CONNECTED ENTRIES <span>{related.length}</span>
          </div>
          <div className="related-list">
            {related.map((target) => {
              const targetMeta = collectionMeta(target.collection);
              return (
                <button
                  type="button"
                  className="related-row"
                  key={`${target.collection}:${entityId(target.entity)}`}
                  onClick={() => onSelect(target)}
                >
                  <span className={`small-icon ${targetMeta.color}`}>
                    {iconFor(targetMeta.icon, 14)}
                  </span>
                  <span className="related-copy">
                    <strong>{entityName(target.entity)}</strong>
                    <small>
                      {target.relationLabel} · {targetMeta.singular}
                    </small>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="inspector-bottom">
        <span className="verified-dot" /> Part of{" "}
        <strong>{worldName(exchange)}</strong>
        <button
          type="button"
          className="icon-button more-details"
          aria-label="More entry actions"
        >
          ···
        </button>
      </div>
    </div>
  );
}

function WelcomePanel({
  world: exchange,
  source,
  onSelect,
}: {
  world: WorldExchange;
  source: ExchangeSource;
  onSelect: (entry: EntityEntry) => void;
}) {
  const featured =
    collectionEntries(exchange, "people")[0] ??
    collectionEntries(exchange, "cities")[0];
  return (
    <div className="welcome-panel">
      <div className="inspector-top">
        <span className="inspector-label">YOUR FIELD GUIDE</span>
        <span className="fixture-badge">
          <span /> {source === "fixture" ? "FIXTURE" : "PORTABLE FILE"}
        </span>
      </div>
      <div className="guide-art">
        <div className="guide-ring ring-one" />
        <div className="guide-ring ring-two" />
        <div className="guide-star star-one">✳</div>
        <div className="guide-star star-two">✧</div>
        <div className="guide-globe">
          <Globe2 size={52} strokeWidth={1.2} />
        </div>
        <span className="guide-label label-north">NORTH</span>
        <span className="guide-label label-south">SOUTH</span>
      </div>
      <div className="guide-copy">
        <div className="eyebrow eyebrow-muted">A WORLD, CONNECTED</div>
        <h2>
          Curiosity is
          <br />a good place to start.
        </h2>
        <p>
          Look closer at the people, places, and turning points that make{" "}
          {worldName(exchange)} what it is.
        </p>
      </div>
      <div className="guide-tips">
        <div className="guide-tip">
          <span className="tip-number">01</span>
          <span>
            <strong>Search across everything</strong>
            <small>Find a name, place, or idea.</small>
          </span>
          <Search size={16} />
        </div>
        <div className="guide-tip">
          <span className="tip-number">02</span>
          <span>
            <strong>Follow the connections</strong>
            <small>Every entry opens another door.</small>
          </span>
          <ArrowUpRight size={16} />
        </div>
      </div>
      {featured && (
        <button
          className="featured-entry"
          type="button"
          onClick={() => onSelect(featured)}
        >
          <span className="featured-icon">
            <Compass size={15} />
          </span>
          <span>
            <small>START EXPLORING</small>
            <strong>{entityName(featured.entity)}</strong>
          </span>
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="inline-empty">{text}</div>;
}

export default App;
