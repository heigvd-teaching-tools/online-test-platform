/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

export const AnnotationState = {
    NOT_ANNOTATED: {
        value: 'NOT_ANNOTATED',
        css: {
            boxSizing: 'border-box',
            border: '2px solid transparent',
        },
    },
    ANNOTATED: {
        value: 'ANNOTATED',
        css: {
            border: '2px solid #0000ff40',
        }
    },
}
  
export const EditingState = {
    HOVER: {
        value: 'HOVER',
        css: {
            border: '2px dashed #0000ff40',
        }
    },
    ACTIVE: {
        value: 'ACTIVE',
        css: {
            border: '2px dashed #009d00d6',
        }
    },
    INACTIVE: {
        value: 'INACTIVE',
    },
}
  