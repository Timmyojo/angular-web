import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LabComponent } from "./lab.component";
import { GenericDatatableLabComponent } from "./components/generic-datatable-lab/generic-datatable-lab.component";
import { Route, RouterModule } from "@angular/router";
import { GenericDatatableComponent } from "../../components/generic-datatable/generic-datatable.component";
import { GenericFileManagerComponent } from "../../components/generic-file-manager/generic-file-manager.component";
import { GenericTextEditorComponent } from "../../components/generic-text-editor/generic-text-editor.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const routes: Route[] = [{ path: "", component: LabComponent }];

@NgModule({
  declarations: [LabComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    FormsModule,
    ReactiveFormsModule,
    // GenericDatatable
    GenericDatatableComponent,
    GenericDatatableLabComponent,
    GenericFileManagerComponent,
    GenericTextEditorComponent,
  ],
})
export class LabModule {}
