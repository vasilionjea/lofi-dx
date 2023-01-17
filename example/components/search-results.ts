import { pojo } from "../utils";
import CoreComponent from "./core";

/**
 * Search Results
 */
export default class SearchResults extends CoreComponent {
  get classNames() {
    return ['search-results'];
  }

  private resultsTemplate(data: any[]): string {
    return data.reduce((str, o) => str + `<article>${o.title}${o.body}</article>`, '');
  }

  private noResultsTemplate() {
    return '<p>No results found</p>';
  }

  render(data: pojo[] | null = []) {
    if (!data) {
      this.element.innerHTML = '';
    } else {
      this.element.innerHTML = data.length ? this.resultsTemplate(data) : this.noResultsTemplate();
    }

    return this;
  }
}
